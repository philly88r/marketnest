@echo off
echo Committing and pushing Altare checklist changes to Git...

cd c:\Users\info\CascadeProjects\agency-website

git add supabase/migrations/20250508_update_altare_checklist.sql
git add supabase/migrations/20250508_add_styling_metadata_to_checklist.sql
git add supabase/migrations/20250508_fix_client004_checklist_filters.sql
git add supabase/migrations/20250508_flag_client004_component_update.sql

git commit -m "Add Altare checklist updates with styling changes and fixes"

git push

echo Done!
pause
