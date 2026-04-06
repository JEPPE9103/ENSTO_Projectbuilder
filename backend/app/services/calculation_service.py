import math
from collections import defaultdict
from typing import Dict, List

from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Estimate, EstimateRow
from app.repositories import EstimateRepository, ProductRepository
from app.schemas import (
    EstimateCalculationResult,
    EstimateCreate,
    MaterialRow,
    SystemConfiguration,
)


class CalculationService:
    """
    Service responsible for turning a system configuration into a material list.

    The v1 implementation supports a channel-like system and is intentionally
    structured so that additional system types can be plugged in later.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.product_repo = ProductRepository(session)
        self.estimate_repo = EstimateRepository(session)

    async def calculate_materials(
        self, config: SystemConfiguration
    ) -> EstimateCalculationResult:
        if config.system_type == "channel":
            rows = await self._calculate_channel_system(config)
        else:
            # Generic fallback: for now we only support channel explicitly
            raise ValueError(f"Unsupported system_type: {config.system_type}")

        return EstimateCalculationResult(material_rows=rows)

    async def _calculate_channel_system(
        self, config: SystemConfiguration
    ) -> List[MaterialRow]:
        base_product = await self.product_repo.find_base_product(
            category=config.category,
            series=config.series,
            size=config.size,
            color=config.color,
        )
        if not base_product:
            raise ValueError("Base channel product not found for configuration")

        relations = await self.product_repo.get_related_products(base_product.id)

        by_type: Dict[str, list] = defaultdict(list)
        for rel in relations:
            if not rel.related_product:
                continue
            by_type[rel.relation_type].append(rel.related_product)

        # v1: we simply pick the first related product for each relation type
        lid_product = by_type.get("lid", [None])[0]
        inner_corner_product = by_type.get("inner_corner", [None])[0]
        outer_corner_product = by_type.get("outer_corner", [None])[0]
        tee_product = by_type.get("tee", [None])[0]
        end_cap_product = by_type.get("end_cap", [None])[0]

        # Base channel quantity
        base_count = math.ceil(
            config.total_length_meters / max(config.piece_length_meters, 0.001)
        )
        if config.spare_percent > 0:
            base_count = math.ceil(base_count * (1 + config.spare_percent / 100.0))

        rows: List[MaterialRow] = []

        # Base channel
        rows.append(
            MaterialRow(
                product_id=base_product.id,
                article_number=base_product.article_number,
                product_name=base_product.name,
                quantity=base_count,
                unit=base_product.unit,
                comment="Base channel (incl. spare)",
            )
        )

        # Lid quantity equals channel quantity
        if lid_product:
            rows.append(
                MaterialRow(
                    product_id=lid_product.id,
                    article_number=lid_product.article_number,
                    product_name=lid_product.name,
                    quantity=base_count,
                    unit=lid_product.unit,
                    comment="Channel lid",
                )
            )

        def add_fitting_row(
            product, quantity: int, label: str
        ) -> None:  # type: ignore[no-untyped-def]
            if not product or quantity <= 0:
                return
            rows.append(
                MaterialRow(
                    product_id=product.id,
                    article_number=product.article_number,
                    product_name=product.name,
                    quantity=math.ceil(quantity),
                    unit=product.unit,
                    comment=label,
                )
            )

        add_fitting_row(inner_corner_product, config.inner_corners, "Inner corner")
        add_fitting_row(outer_corner_product, config.outer_corners, "Outer corner")
        add_fitting_row(tee_product, config.tee_joints, "Tee joint")
        add_fitting_row(end_cap_product, config.end_caps, "End cap")

        return rows

    async def save_estimate(self, payload: EstimateCreate) -> Estimate:
        estimate = Estimate(project_system_id=payload.project_system_id)
        rows: list[EstimateRow] = []

        for r in payload.material_rows:
            rows.append(
                EstimateRow(
                    estimate_id=0,  # will be set when persisted
                    product_id=r.product_id,
                    article_number_snapshot=r.article_number,
                    product_name_snapshot=r.product_name,
                    quantity=r.quantity,
                    unit=r.unit,
                    comment=r.comment,
                )
            )

        return await self.estimate_repo.create_estimate_with_rows(estimate, rows)

