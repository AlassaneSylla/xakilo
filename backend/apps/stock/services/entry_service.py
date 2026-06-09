def adjust_product_stock_on_entry_save(entry, old_quantity=None, old_product=None):
    """
    Ajuste le stock du produit après une création ou modification d'entrée.
    """
    product = entry.product
    new_quantity = entry.quantity

    # Si on modifie une ancienne entrée, il faut corriger l'ancien stock
    if old_product:
        # Si on a changé de produit
        if old_product != product:
            old_product.stock -= old_quantity
            old_product.save()
        else:
            # Même produit, juste ajuster la différence
            diff = new_quantity - old_quantity
            old_product.stock += diff
            old_product.save()
    else:
        # Création : simple ajout
        product.stock += new_quantity
        product.save()


def adjust_product_stock_on_entry_delete(entry):
    """
    Réduit le stock si une entrée est supprimée.
    """
    product = entry.product
    if product:
        product.stock -= entry.quantity
        product.save()
