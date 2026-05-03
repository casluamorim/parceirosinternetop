CREATE UNIQUE INDEX IF NOT EXISTS coverage_areas_city_neighborhood_unique
  ON public.coverage_areas (city, lower(neighborhood));