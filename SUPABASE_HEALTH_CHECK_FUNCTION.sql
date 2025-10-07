-- =====================================================
-- HEALTH CHECK SUPPORT FUNCTION
-- Returns status of cron jobs for monitoring
-- =====================================================

CREATE OR REPLACE FUNCTION get_cron_job_status()
RETURNS TABLE(
  job_name TEXT,
  schedule TEXT,
  last_run TIMESTAMPTZ,
  last_status TEXT,
  next_run TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobname::TEXT as job_name,
    j.schedule::TEXT,
    MAX(jrd.start_time) as last_run,
    (
      SELECT jrd2.status::TEXT
      FROM cron.job_run_details jrd2
      WHERE jrd2.jobid = j.jobid
      ORDER BY jrd2.start_time DESC
      LIMIT 1
    ) as last_status,
    cron.schedule_next_run(j.schedule, NOW()) as next_run,
    j.active as is_active
  FROM cron.job j
  LEFT JOIN cron.job_run_details jrd ON jrd.jobid = j.jobid
  WHERE j.jobname IN (
    'auto-release-reserves',
    'detect-fraud',
    'detect-duplicate-qr',
    'auto-resolve-disputes'
  )
  GROUP BY j.jobid, j.jobname, j.schedule, j.active
  ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_cron_job_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_status() TO anon;
