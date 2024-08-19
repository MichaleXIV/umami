import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { QueryFilters } from 'lib/types';

export async function getWebsiteSessionStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  return rawQuery(
    `
    select
      count(*) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      count(distinct t.country) as "countries",
      sum(case when event_type = 2 then 1 else 0 end) as "events"
    from website_event
    join session on website_event.session_id = session.session_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  return rawQuery(
    `
    select
      sum(views) as "pageviews",
      uniq(session_id) as "visitors",
      uniq(visit_id) as "visits",
      uniq(country) as "countries",
      sum(length(event_name)) as "events"
    from umami.website_event_stats_hourly "website_event"
    where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
    `,
    params,
  ).then(result => {
    return Object.values(result).map((a: any) => {
      return {
        pageviews: Number(a.pageviews),
        visitors: Number(a.visitors),
        visits: Number(a.visits),
        countries: Number(a.countries),
        events: Number(a.events),
      };
    });
  });
}
