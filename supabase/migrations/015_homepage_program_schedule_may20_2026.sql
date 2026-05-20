-- Homepage program card (4-week noticing): 4 rows from Fri May 22, 2026 (today);
-- then Wed May 27, Fri May 29, Wed Jun 3. Progress: week 4 of 4.

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
                    replace(
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
                                        'week 4 of 4'
                                      ),
                                      'week 3 of 4',
                                      'week 4 of 4'
                                    ),
                                    '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 3"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · May 13"}]}]},',
                                    ''
                                  ),
                                  '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 3"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 15"}]}]},',
                                  ''
                                ),
                                '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 3"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · May 20"}]}]},',
                                ''
                              ),
                              '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 3"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 22"}]}]},',
                              ''
                            ),
                            '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · May 20"}]}]},',
                            ''
                          ),
                          '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 22"}]}]},',
                          ''
                        ),
                        '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · May 27"}]}]},',
                        ''
                      ),
                      '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 29"}]}]},',
                      ''
                    ),
                    '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 5"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · Jun 03"}]}]},',
                    ''
                  ),
                  '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 5"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · Jun 05"}]}]},',
                  ''
                ),
                '{"type":"paragraph","content":[{"type":"text","text":"All sessions 09:00 — 10:00 Pacific · on Zoom"',
                '{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 22"}]}]},{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · May 27"}]}]},{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Fri · May 29"}]}]},{"type":"thusnessProgramRow","content":[{"type":"paragraph","content":[{"type":"text","text":"Week 4"}]},{"type":"paragraph","content":[{"type":"text","text":"Guided Noticing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wed · Jun 03"}]}]},{"type":"paragraph","content":[{"type":"text","text":"All sessions 09:00 — 10:00 Pacific · on Zoom"'
              ),
              ',,',
              ','
            ),
            ',]',
            ']'
          ),
          '[,',
          '['
        )
  )::jsonb
where content_json::text ilike '%thusnessProgramCard%'
  and (
    content_json::text not ilike '%week 4 of 4%'
    or content_json::text ilike '%Wed · May 13%'
    or content_json::text ilike '%Wed · May 20%'
    or content_json::text not ilike '%Wed · Jun 03%'
    or content_json::text ilike '%Fri · Jun 05%'
  );
