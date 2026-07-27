import { casesData } from "./reviewCaseData";

export type NetworkRisk = "Low" | "Medium" | "High";
export type NetworkType = "Network" | "Household";

export type NetworkMember = {
  id: string;
  name: string;
  clientId: string;
  relationship: string;
  matches: number;
  focusLabel: string | null;
  status: "Active" | "Inactive";
  risk: NetworkRisk;
};

export type ClientNetwork = {
  id: string;
  name: string;
  networkId: string;
  type: NetworkType;
  risk: NetworkRisk;
  members: readonly NetworkMember[];
};

const FIRST_NAMES = [
  "Sarah",
  "Michael",
  "Emily",
  "David",
  "Anna",
  "James",
  "Olivia",
  "Daniel",
  "Sophia",
  "William",
] as const;

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
] as const;

const RELATIONSHIPS = [
  "Owner",
  "Spouse",
  "Child",
  "Sibling",
  "Parent",
  "Associate",
  "Beneficiary",
] as const;

const RISKS: readonly NetworkRisk[] = ["Low", "Medium", "High"];
const TYPES: readonly NetworkType[] = ["Network", "Household"];

function caseUnit(caseIndex: number, salt: number): number {
  const x = Math.sin((caseIndex + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(list: readonly T[], caseIndex: number, salt: number): T {
  return list[Math.floor(caseUnit(caseIndex, salt) * list.length)]!;
}

function networkIdFor(caseIndex: number, networkIndex: number): string {
  const base = 1000000 + Math.floor(caseUnit(caseIndex, 100 + networkIndex) * 8999999);
  return String(base);
}

function clientIdFor(caseIndex: number, salt: number): string {
  return String(100000 + Math.floor(caseUnit(caseIndex, salt) * 899999));
}

function buildMember(
  caseIndex: number,
  networkIndex: number,
  memberIndex: number,
  nameOverride?: string,
  relationshipOverride?: string,
): NetworkMember {
  const salt = 200 + networkIndex * 20 + memberIndex;
  const first = pick(FIRST_NAMES, caseIndex, salt);
  const last = pick(LAST_NAMES, caseIndex, salt + 1);
  return {
    id: `member-${caseIndex}-${networkIndex}-${memberIndex}`,
    name: nameOverride ?? `${first} ${last}`,
    clientId: clientIdFor(caseIndex, salt + 2),
    relationship: relationshipOverride ?? pick(RELATIONSHIPS, caseIndex, salt + 3),
    matches: Math.floor(caseUnit(caseIndex, salt + 4) * 8),
    focusLabel: caseUnit(caseIndex, salt + 5) > 0.35 ? "ISI Focus" : null,
    status: caseUnit(caseIndex, salt + 6) > 0.15 ? "Active" : "Inactive",
    risk: pick(RISKS, caseIndex, salt + 7),
  };
}

const JOHN_SMITH_NETWORKS: readonly ClientNetwork[] = [
  {
    id: "network-0-0",
    name: "John Smith",
    networkId: "2934942",
    type: "Network",
    risk: "Medium",
    members: [
      {
        id: "member-0-0-0",
        name: "John Smith",
        clientId: "349492",
        relationship: "Owner",
        matches: 5,
        focusLabel: "ISI Focus",
        status: "Active",
        risk: "Medium",
      },
      {
        id: "member-0-0-1",
        name: "Sarah Smith",
        clientId: "660502",
        relationship: "Spouse",
        matches: 0,
        focusLabel: "ISI Focus",
        status: "Active",
        risk: "Low",
      },
    ],
  },
  {
    id: "network-0-1",
    name: "Unknown",
    networkId: "5454033",
    type: "Household",
    risk: "High",
    members: Array.from({ length: 8 }, (_, memberIndex) =>
      buildMember(0, 1, memberIndex),
    ),
  },
];

function randomNetworksForCase(caseIndex: number): ClientNetwork[] {
  const clientName = casesData[caseIndex]?.name ?? "Client";
  const networkCount = 1 + Math.floor(caseUnit(caseIndex, 1) * 3);
  const networks: ClientNetwork[] = [];

  for (let n = 0; n < networkCount; n += 1) {
    const type = pick(TYPES, caseIndex, 10 + n);
    const risk = pick(RISKS, caseIndex, 20 + n);
    const memberCount = 2 + Math.floor(caseUnit(caseIndex, 30 + n) * 5);
    const name =
      n === 0
        ? clientName
        : caseUnit(caseIndex, 40 + n) > 0.55
          ? "Unknown"
          : `${pick(FIRST_NAMES, caseIndex, 50 + n)} ${pick(LAST_NAMES, caseIndex, 51 + n)}`;

    const members = Array.from({ length: memberCount }, (_, memberIndex) =>
      buildMember(
        caseIndex,
        n,
        memberIndex,
        memberIndex === 0 && n === 0 ? clientName : undefined,
        memberIndex === 0 ? "Owner" : undefined,
      ),
    );

    networks.push({
      id: `network-${caseIndex}-${n}`,
      name,
      networkId: networkIdFor(caseIndex, n),
      type,
      risk,
      members,
    });
  }

  return networks;
}

export function initialNetworksForCase(caseIndex: number): ClientNetwork[] {
  const clientName = casesData[caseIndex]?.name;
  if (!clientName) return [];
  if (clientName.includes("Muammar")) return [];
  if (clientName === "John Smith") {
    return JOHN_SMITH_NETWORKS.map((network) => ({
      ...network,
      members: network.members.map((member) => ({ ...member })),
    }));
  }
  return randomNetworksForCase(caseIndex);
}

export function riskBadgeVariant(
  risk: NetworkRisk,
): "green" | "yellow" | "red" {
  if (risk === "Low") return "green";
  if (risk === "Medium") return "yellow";
  return "red";
}
