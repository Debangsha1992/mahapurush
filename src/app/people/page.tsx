import Link from "next/link";
import { PersonCard } from "@/components/people/person-card";
import { Card } from "@/components/ui/card";
import {
  PERSON_DOMAIN_IDS,
  PERSON_DOMAINS,
  type PersonDomainId,
} from "@/lib/constants/person-domains";
import {
  PERSON_REGION_IDS,
  PERSON_REGIONS,
  type PersonRegionId,
} from "@/lib/constants/person-regions";
import { getPeoplePage } from "@/lib/content/loaders";

type PeopleSearchParams = {
  q?: string | string[];
  domain?: string | string[];
  region?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPersonDomainId(value: string | undefined): PersonDomainId | undefined {
  return PERSON_DOMAIN_IDS.includes(value as PersonDomainId)
    ? (value as PersonDomainId)
    : undefined;
}

function toPersonRegionId(value: string | undefined): PersonRegionId | undefined {
  return PERSON_REGION_IDS.includes(value as PersonRegionId)
    ? (value as PersonRegionId)
    : undefined;
}

function toPageNumber(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function pageHref({
  query,
  primaryDomain,
  regionId,
  page,
}: {
  query: string;
  primaryDomain?: PersonDomainId;
  regionId?: PersonRegionId;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (primaryDomain) {
    params.set("domain", primaryDomain);
  }
  if (regionId) {
    params.set("region", regionId);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/people?${queryString}` : "/people";
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<PeopleSearchParams>;
}) {
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() ?? "";
  const primaryDomain = toPersonDomainId(firstValue(params.domain));
  const regionId = toPersonRegionId(firstValue(params.region));
  const page = toPageNumber(firstValue(params.page));
  const result = getPeoplePage({
    query,
    primaryDomain,
    regionId,
    page,
    pageSize: 24,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
          People Library
        </p>
        <h2 className="mt-2 text-3xl font-semibold">1000 notable people</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Browse source-backed profiles from science, philosophy, justice,
          culture, and human achievement.
        </p>
      </div>

      <Card>
        <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]" action="/people">
          <label className="space-y-2">
            <span className="text-sm font-medium">Search</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search Einstein, justice, poetry..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Domain</span>
            <select
              name="domain"
              defaultValue={primaryDomain ?? ""}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            >
              <option value="">All domains</option>
              {PERSON_DOMAINS.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Region</span>
            <select
              name="region"
              defaultValue={regionId ?? ""}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            >
              <option value="">All regions</option>
              {PERSON_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="self-end rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[#101014] transition hover:bg-[var(--color-accent-soft)]"
          >
            Filter
          </button>
        </form>
      </Card>

      <div className="flex items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
        <p>
          Showing {result.people.length} of {result.total} people
        </p>
        <p>
          Page {result.page} of {result.totalPages}
        </p>
      </div>

      {result.people.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <Card>
          <h3 className="text-xl font-semibold">No people found</h3>
          <p className="mt-2 text-[var(--color-muted)]">
            Try a broader search or clear one of the filters.
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4">
        {result.page > 1 ? (
          <Link
            href={pageHref({
              query,
              primaryDomain,
              regionId,
              page: result.page - 1,
            })}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-3 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        {result.page < result.totalPages && (
          <Link
            href={pageHref({
              query,
              primaryDomain,
              regionId,
              page: result.page + 1,
            })}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-3 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
