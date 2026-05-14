from django.template import Library

register = Library()


@register.filter()
def placeholder(field, text):
    # If it's not a form field, just return it unchanged
    if not hasattr(field, "field"):
        return field

    field.field.widget.attrs["placeholder"] = text
    return field
