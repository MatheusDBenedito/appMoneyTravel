-- Create a function that inserts default categories for a given trip
CREATE OR REPLACE FUNCTION public.seed_trip_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (name, icon, trip_id)
    VALUES 
        ('Alimentação', 'Utensils', NEW.id),
        ('Transporte', 'Bus', NEW.id),
        ('Hospedagem', 'Bed', NEW.id),
        ('Compras', 'ShoppingBag', NEW.id),
        ('Lazer', 'Ticket', NEW.id),
        ('Saúde', 'Activity', NEW.id),
        ('Outros', 'Circle', NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on trips table
DROP TRIGGER IF EXISTS trigger_seed_trip_categories ON public.trips;
CREATE TRIGGER trigger_seed_trip_categories
AFTER INSERT ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.seed_trip_categories();

-- Backfill: Insert categories for existing trips that don't have them
INSERT INTO public.categories (name, icon, trip_id)
SELECT d.name, d.icon, t.id
FROM public.trips t
CROSS JOIN (
    VALUES 
        ('Alimentação', 'Utensils'),
        ('Transporte', 'Bus'),
        ('Hospedagem', 'Bed'),
        ('Compras', 'ShoppingBag'),
        ('Lazer', 'Ticket'),
        ('Saúde', 'Activity'),
        ('Outros', 'Circle')
) AS d(name, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.trip_id = t.id AND c.name = d.name
);
