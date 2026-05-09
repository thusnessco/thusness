-- Advance the 4-week noticing program card (May 2026):
-- Drop past Week 2 rows (Wed May 6, Fri May 8); shift Week 3 up; add Week 4 (Wed May 20, Fri May 22).
-- Progress line: week 2 of 4 -> week 3 of 4.
-- TipTap stores dates as "Wed · May 06" (column 3 is uppercased in CSS).
-- Applies only to notes whose JSON matches this card (homepage pin or any note with the same schedule).

update public.notes
set content_json =
  replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    content_json::text,
                    'week 2 of 4',
                    'week 3 of 4'
                  ),
                  'Wed · May 13',
                  '__THUSNESS_MIG_D1__'
                ),
                'Fri · May 15',
                '__THUSNESS_MIG_D2__'
              ),
              'Wed · May 06',
              'Wed · May 13'
            ),
            'Fri · May 08',
            'Fri · May 15'
          ),
          '__THUSNESS_MIG_D1__',
          'Wed · May 20'
        ),
        '__THUSNESS_MIG_D2__',
        'Fri · May 22'
      ),
      'Week 3',
      'Week 4'
    ),
    'Week 2',
    'Week 3'
  )::jsonb
where content_json::text ilike '%thusnessProgramCard%'
  and content_json::text ilike '%week 2 of 4%'
  and content_json::text ilike '%Wed · May 06%';
