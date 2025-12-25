class Pagination:
    PER_PAGE_OPTIONS = [4, 6, 8, 12]

    def get_paginate_by(self, queryset):
        try:
            per_page = int(self.request.GET.get('per_page', 12))
            return per_page if per_page in self.PER_PAGE_OPTIONS else 12
        except (TypeError, ValueError):
            return 12


class SortingMixin:

    def apply_sorting(self, queryset, prefix=""):
        sort = self.request.GET.get('sort', 'newest')

        if sort == 'oldest':
            return queryset.order_by(f"{prefix}created_at")

        if sort == 'price':
            return queryset.order_by(f"{prefix}price")

        # default: newest
        return queryset.order_by(f"-{prefix}created_at")
