from dataclasses import dataclass


def effective_unit_price(
    *,
    unit_price_override: float | None,
    catalog_unit_price: float | None,
) -> float | None:
    if unit_price_override is not None:
        return unit_price_override
    return catalog_unit_price


def line_total(
    *,
    quantity: int | float,
    effective_price: float | None,
) -> float | None:
    if effective_price is None:
        return None
    return round(float(quantity) * effective_price, 2)


@dataclass
class PricingTotals:
    subtotal: float
    has_missing_prices: bool


def summarize_totals(line_totals: list[float | None]) -> PricingTotals:
    subtotal = 0.0
    has_missing_prices = False
    for value in line_totals:
        if value is None:
            has_missing_prices = True
            continue
        subtotal += value
    return PricingTotals(subtotal=round(subtotal, 2), has_missing_prices=has_missing_prices)
