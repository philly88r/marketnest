-- Script to remove duplicate marketing tasks while keeping one copy of each
DO $$
DECLARE
    task_count INTEGER;
BEGIN
    -- First, check if we have duplicates
    SELECT COUNT(*) INTO task_count FROM public.marketing_tasks;
    RAISE NOTICE 'Total marketing tasks before cleanup: %', task_count;
    
    -- Create a temporary table to identify duplicates
    CREATE TEMP TABLE temp_duplicates AS
    WITH duplicates AS (
        SELECT 
            id,
            task_name,
            description,
            assigned_to,
            start_date,
            end_date,
            ROW_NUMBER() OVER (
                PARTITION BY task_name, description, assigned_to, start_date, end_date
                ORDER BY id
            ) AS row_num
        FROM public.marketing_tasks
    )
    SELECT id FROM duplicates WHERE row_num > 1;
    
    -- Get count of duplicates
    SELECT COUNT(*) INTO task_count FROM temp_duplicates;
    RAISE NOTICE 'Found % duplicate tasks to remove', task_count;
    
    -- Delete the duplicates
    DELETE FROM public.marketing_tasks
    WHERE id IN (SELECT id FROM temp_duplicates);
    
    -- Get final count
    SELECT COUNT(*) INTO task_count FROM public.marketing_tasks;
    RAISE NOTICE 'Total marketing tasks after cleanup: %', task_count;
    
    -- Drop the temporary table
    DROP TABLE temp_duplicates;
    
    RAISE NOTICE 'Duplicate marketing tasks have been removed successfully';
END
$$;
