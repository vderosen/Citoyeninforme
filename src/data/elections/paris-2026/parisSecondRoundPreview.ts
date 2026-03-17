import { ARRONDISSEMENT_LEADER_PHOTOS } from "./arrondissementLeaderPhotos";

type RawSectorResult = {
  id: string;
  officialLabel: string;
  lists: {
    listName: string;
    leader: string;
    nuance: string;
    votes: string;
    pct: number;
  }[];
};

export type PreviewQualificationStatus = "maintain" | "merge";
export type PreviewPoliticalTone =
  | "left"
  | "right"
  | "center"
  | "far-right"
  | "left-independent"
  | "right-independent"
  | "centrist-independent";

export interface PreviewFigure {
  id: string;
  name: string;
  role: string;
  bio: string;
  shortPartyLabel: string;
  partyLabel: string;
  candidateId?: string;
  photoUrl?: string;
  isLead?: boolean;
}

export interface PreviewContribution {
  label: string;
  pct: number;
  votes: string;
  note: string;
}

export interface PreviewSectorList {
  id: string;
  listName: string;
  shortBlocLabel: string;
  blocLabel: string;
  tone: PreviewPoliticalTone;
  qualificationStatus: PreviewQualificationStatus;
  qualificationNote: string;
  listSummary: string;
  votes: string;
  pct: number;
  figures: PreviewFigure[];
  firstRoundContributions: PreviewContribution[];
}

export interface PreviewSector {
  id: string;
  mapLabel: string;
  label: string;
  arrondissementLabel: string;
  officialLabel: string;
  sourceUrl: string;
  lists: PreviewSectorList[];
}

export interface SectorLayoutItem {
  sectorId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const OFFICIAL_SOURCE_BASE_URL =
  "https://www.resultats-elections.interieur.gouv.fr/ConseilsdarrondissementPLM2026/ensemble_geographique/11/75";

const CITYWIDE_CANDIDATES = {
  "david-belliard": "David Belliard",
  "emmanuel-gregoire": "Emmanuel Grégoire",
  "pierre-yves-bournazel": "Pierre-Yves Bournazel",
  "rachida-dati": "Rachida Dati",
  "sarah-knafo": "Sarah Knafo",
  "sophia-chikirou": "Sophia Chikirou",
  "thierry-mariani": "Thierry Mariani",
} as const;

type CitywideCandidateId = keyof typeof CITYWIDE_CANDIDATES;

const RAW_SECTOR_RESULTS: RawSectorResult[] = [
  {
    id: "01",
    officialLabel: "Paris 1er secteur (75056SR01)",
    lists: [
      {
        listName:
          "Paris Centre est à vous ! Avec Ariel Weil et Emmanuel Grégoire L'union de la gauche et des écologistes",
        leader: "M. Ariel WEIL",
        nuance: "LUG",
        votes: "17 647",
        pct: 42.74,
      },
      {
        listName: "Changer Paris Centre avec Aurélien Véron et Rachida Dati",
        leader: "M. Aurélien VÉRON",
        nuance: "LUD",
        votes: "9 652",
        pct: 23.38,
      },
      {
        listName: "PARIS CENTRE APAISÉ AVEC MARTINE FIGUÉROA",
        leader: "Mme Martine FIGUÉROA",
        nuance: "LUC",
        votes: "4 687",
        pct: 11.35,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE CENTRE",
        leader: "M. Cédric PANIZZI",
        nuance: "LFI",
        votes: "4 583",
        pct: 11.1,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Rebecca SIROIS",
        nuance: "LEXD",
        votes: "3 439",
        pct: 8.33,
      },
    ],
  },
  {
    id: "05",
    officialLabel: "Paris 5eme secteur (75056SR05)",
    lists: [
      {
        listName: "Liste d'union de la droite et du centre pour le 5ème",
        leader: "Mme Florence BERTHOUT",
        nuance: "LUC",
        votes: "9 220",
        pct: 36.04,
      },
      {
        listName:
          "Le 5e est à vous ! avec Marine Rosset et Emmanuel Grégoire L'union de la gauche et des écologistes",
        leader: "Mme Marine ROSSET",
        nuance: "LUG",
        votes: "8 324",
        pct: 32.54,
      },
      {
        listName: "Changer Paris 5 avec Anne Biraben et Rachida Dati",
        leader: "Mme Anne BIRABEN",
        nuance: "LUD",
        votes: "2 792",
        pct: 10.91,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 5e",
        leader: "M. Ludovic HETZEL",
        nuance: "LFI",
        votes: "2 469",
        pct: 9.65,
      },
      {
        listName: "Sarah Knafo pour Paris - une ville heureuse",
        leader: "M. Rene-Paul BARTOLI",
        nuance: "LEXD",
        votes: "1 396",
        pct: 5.46,
      },
    ],
  },
  {
    id: "06",
    officialLabel: "Paris 6eme secteur (75056SR06)",
    lists: [
      {
        listName: "Changer Paris - Pour le 6eme",
        leader: "M. Jean-Pierre LECOQ",
        nuance: "LUD",
        votes: "7 246",
        pct: 42.32,
      },
      {
        listName:
          "Paris 6eme est a vous! Avec Celine Hervieu et Emmanuel Gregoire L'union de la gauche et des ecologistes",
        leader: "Mme Celine HERVIEU",
        nuance: "LUG",
        votes: "4 237",
        pct: 24.74,
      },
      {
        listName: "Paris 6eme Apaise avec Antoine Lesieur",
        leader: "M. Antoine LESIEUR",
        nuance: "LUC",
        votes: "2 759",
        pct: 16.11,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Hilaire BOUYE",
        nuance: "LEXD",
        votes: "1 622",
        pct: 9.47,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 6e",
        leader: "Mme Coline BOURET",
        nuance: "LFI",
        votes: "987",
        pct: 5.76,
      },
    ],
  },
  {
    id: "07",
    officialLabel: "Paris 7eme secteur (75056SR07)",
    lists: [
      {
        listName: "CHANGER PARIS - RACHIDA DATI POUR LE 7eme",
        leader: "Mme Rachida DATI",
        nuance: "LUD",
        votes: "12 667",
        pct: 58.77,
      },
      {
        listName:
          "LE 7e EST A VOUS ! AVEC ANNE-FLORE ROUILLON ET EMMANUEL GREGOIRE. L'UNION DE LA GAUCHE ET DES ECOLOGISTES",
        leader: "Mme Anne-Flore ROUILLON",
        nuance: "LUG",
        votes: "3 222",
        pct: 14.95,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Arthur PARIS",
        nuance: "LEXD",
        votes: "2 349",
        pct: 10.9,
      },
      {
        listName: "PARIS 7EME APAISE AVEC GREGORY LENTZ",
        leader: "M. Gregory LENTZ",
        nuance: "LUC",
        votes: "2 300",
        pct: 10.67,
      },
    ],
  },
  {
    id: "08",
    officialLabel: "Paris 8eme secteur (75056SR08)",
    lists: [
      {
        listName:
          "CHANGER PARIS - POUR LE 8e AVEC CATHERINE LECUYER - LISTE D'UNION DE LA DROITE ET DU CENTRE",
        leader: "Mme Catherine LECUYER",
        nuance: "LUD",
        votes: "6 216",
        pct: 39.99,
      },
      {
        listName: "LE 8E AU COEUR DE NOTRE ACTION",
        leader: "Mme Jeanne D'HAUTESERRE",
        nuance: "LDVD",
        votes: "2 453",
        pct: 15.78,
      },
      {
        listName:
          "Le 8e est a vous ! avec Thea Fourdrinier et Emmanuel Gregoire. L'union de la gauche et des ecologistes",
        leader: "Mme Thea FOURDRINIER",
        nuance: "LUG",
        votes: "2 331",
        pct: 15,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Marie COLLIN",
        nuance: "LEXD",
        votes: "2 017",
        pct: 12.98,
      },
      {
        listName: "PARIS 8EME APAISE AVEC AGNES BRICARD",
        leader: "Mme Agnes BRICARD",
        nuance: "LUC",
        votes: "1 485",
        pct: 9.55,
      },
    ],
  },
  {
    id: "09",
    officialLabel: "Paris 9eme secteur (75056SR09)",
    lists: [
      {
        listName: "Changer Paris avec Delphine BURKLI pour le 9e",
        leader: "Mme Delphine BURKLI",
        nuance: "LUD",
        votes: "11 370",
        pct: 43.41,
      },
      {
        listName:
          "Le 9e est a vous! Avec Camille Vizioz-Brami et Emmanuel Gregoire L'union de la gauche et des ecologistes",
        leader: "Mme Camille VIZIOZ-BRAMI",
        nuance: "LUG",
        votes: "7 303",
        pct: 27.88,
      },
      {
        listName: "PARIS 9E APAISE AVEC SEBASTIEN DULERMO",
        leader: "M. Sebastien DULERMO",
        nuance: "LUC",
        votes: "2 581",
        pct: 9.85,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 9e",
        leader: "Mme Embla FAUTRA",
        nuance: "LFI",
        votes: "2 264",
        pct: 8.64,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Marine CHIABERTO",
        nuance: "LEXD",
        votes: "1 779",
        pct: 6.79,
      },
    ],
  },
  {
    id: "10",
    officialLabel: "Paris 10eme secteur (75056SR10)",
    lists: [
      {
        listName:
          "LE 10e EST A VOUS ! AVEC ALEXANDRA CORDEBARD ET EMMANUEL GREGOIRE L'UNION DE LA GAUCHE ET DES ECOLOGISTES",
        leader: "Mme Alexandra CORDEBARD",
        nuance: "LUG",
        votes: "15 334",
        pct: 42.79,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 10e",
        leader: "Mme Marion BEAUVALET",
        nuance: "LFI",
        votes: "6 712",
        pct: 18.73,
      },
      {
        listName: "Tous InDIXpensables, avec Bertil Fort",
        leader: "M. Bertil FORT",
        nuance: "LDVC",
        votes: "4 049",
        pct: 11.3,
      },
      {
        listName: "Changer Paris 10 avec Valentine Serino et Rachida Dati",
        leader: "Mme Valentine SERINO",
        nuance: "LUD",
        votes: "3 965",
        pct: 11.06,
      },
      {
        listName: "Paris 10eme apaise avec Abdoulaye Kante",
        leader: "M. Abdoulaye KANTE",
        nuance: "LUC",
        votes: "2 898",
        pct: 8.09,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Denis LAPOTRE",
        nuance: "LEXD",
        votes: "1 884",
        pct: 5.26,
      },
    ],
  },
  {
    id: "11",
    officialLabel: "Paris 11eme secteur (75056SR11)",
    lists: [
      {
        listName:
          "Le 11e est a vous ! avec David Belliard et Emmanuel Gregoire L'union de la gauche et des ecologistes",
        leader: "M. David BELLIARD",
        nuance: "LUG",
        votes: "29 324",
        pct: 48.93,
      },
      {
        listName: "CHANGER PARIS 11 AVEC NELLY GARNIER ET RACHIDA DATI",
        leader: "Mme Nelly GARNIER",
        nuance: "LUD",
        votes: "9 116",
        pct: 15.21,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 11e",
        leader: "Mme Sabrina NOURI",
        nuance: "LFI",
        votes: "9 113",
        pct: 15.21,
      },
      {
        listName: "PARIS 11 APAISE AVEC DELPHINE GOATER",
        leader: "Mme Delphine GOATER",
        nuance: "LUC",
        votes: "6 231",
        pct: 10.4,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Pierre NOIZAT",
        nuance: "LEXD",
        votes: "4 085",
        pct: 6.82,
      },
    ],
  },
  {
    id: "12",
    officialLabel: "Paris 12eme secteur (75056SR12)",
    lists: [
      {
        listName:
          "Le 12e est a vous ! avec Lucie Castets et Emmanuel Gregoire L'union de la gauche et des ecologistes",
        leader: "Mme Lucie CASTETS",
        nuance: "LUG",
        votes: "24 204",
        pct: 41.85,
      },
      {
        listName: "CHANGER PARIS 12 AVEC VALERIE MONTANDON ET RACHIDA DATI",
        leader: "Mme Valerie MONTANDON",
        nuance: "LUD",
        votes: "13 022",
        pct: 22.52,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 12e",
        leader: "Mme Caroline MECARY",
        nuance: "LFI",
        votes: "7 140",
        pct: 12.35,
      },
      {
        listName: "Paris 12eme apaise avec Clara Chassaniol",
        leader: "Mme Clara CHASSANIOL",
        nuance: "LUC",
        votes: "6 903",
        pct: 11.94,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Jannick TRUNKENWALD",
        nuance: "LEXD",
        votes: "4 190",
        pct: 7.25,
      },
    ],
  },
  {
    id: "13",
    officialLabel: "Paris 13eme secteur (75056SR13)",
    lists: [
      {
        listName:
          "LE 13e EST A VOUS ! AVEC JEROME COUMET ET EMMANUEL GREGOIRE L'UNION DE LA GAUCHE ET DES ECOLOGISTES",
        leader: "M. Jerome COUMET",
        nuance: "LUG",
        votes: "33 872",
        pct: 51.52,
      },
      {
        listName: "CHANGER PARIS 13E AVEC RACHIDA DATI ET JEAN-BAPTISTE OLIVIER",
        leader: "M. Jean-Baptiste OLIVIER",
        nuance: "LUD",
        votes: "9 220",
        pct: 14.02,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 13e",
        leader: "M. Christophe PRUDHOMME",
        nuance: "LFI",
        votes: "8 942",
        pct: 13.6,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Marion BOTTOU",
        nuance: "LEXD",
        votes: "4 253",
        pct: 6.47,
      },
      {
        listName: "Paris 13e apaise avec Pegah Malek-Ahmadi",
        leader: "Mme Pegah MALEK-AHMADI",
        nuance: "LUC",
        votes: "4 079",
        pct: 6.2,
      },
    ],
  },
  {
    id: "14",
    officialLabel: "Paris 14eme secteur (75056SR14)",
    lists: [
      {
        listName:
          "Le 14e est a vous ! Avec Carine Petit et Emmanuel Gregoire. L'union de la gauche et des ecologistes",
        leader: "Mme Carine PETIT",
        nuance: "LUG",
        votes: "22 217",
        pct: 42.2,
      },
      {
        listName: "Changer Paris 14e avec Maud Gatel et Rachida Dati",
        leader: "Mme Maud GATEL",
        nuance: "LUD",
        votes: "11 375",
        pct: 21.61,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 14e",
        leader: "M. Rodrigo ARENAS",
        nuance: "LFI",
        votes: "6 800",
        pct: 12.92,
      },
      {
        listName: "Un 14eme apaise avec Felix de Vidas",
        leader: "M. Felix DE VIDAS",
        nuance: "LUC",
        votes: "5 077",
        pct: 9.64,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Laure COHEN",
        nuance: "LEXD",
        votes: "4 093",
        pct: 7.78,
      },
    ],
  },
  {
    id: "15",
    officialLabel: "Paris 15eme secteur (75056SR15)",
    lists: [
      {
        listName: "Changer Paris avec Rachida Dati et Philippe Goujon pour le 15eme",
        leader: "M. Philippe GOUJON",
        nuance: "LUD",
        votes: "36 921",
        pct: 41.76,
      },
      {
        listName:
          "LE 15e EST A VOUS ! AVEC ANOUCH TORANIAN ET EMMANUEL GREGOIRE - L'UNION DE LA GAUCHE ET DES ECOLOGISTES",
        leader: "Mme Anouch TORANIAN",
        nuance: "LUG",
        votes: "22 091",
        pct: 24.99,
      },
      {
        listName: "PARIS 15E APAISE AVEC CATHERINE IBLED",
        leader: "Mme Catherine IBLED",
        nuance: "LUC",
        votes: "10 520",
        pct: 11.9,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Samuel LAFONT",
        nuance: "LEXD",
        votes: "8 565",
        pct: 9.69,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 15e",
        leader: "Mme Elsa DELANNEE",
        nuance: "LFI",
        votes: "7 547",
        pct: 8.54,
      },
    ],
  },
  {
    id: "16",
    officialLabel: "Paris 16eme secteur (75056SR16)",
    lists: [
      {
        listName: "CHANGER PARIS AVEC JEREMY REDLER POUR LE 16e",
        leader: "M. Jeremy REDLER",
        nuance: "LUD",
        votes: "30 927",
        pct: 50.62,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Sarah KNAFO",
        nuance: "LEXD",
        votes: "13 763",
        pct: 22.53,
      },
      {
        listName: "PARIS 16EME APAISE AVEC EMMANUELLE HOFFMAN",
        leader: "Mme Emmanuelle HOFFMAN",
        nuance: "LUC",
        votes: "7 264",
        pct: 11.89,
      },
      {
        listName:
          "Le 16e est a vous ! Avec Genevieve Garrigos et Emmanuel Gregoire. L'union de la gauche et les ecologistes",
        leader: "Mme Genevieve GARRIGOS",
        nuance: "LUG",
        votes: "5 929",
        pct: 9.71,
      },
    ],
  },
  {
    id: "17",
    officialLabel: "Paris 17eme secteur (75056SR17)",
    lists: [
      {
        listName: "CHANGER PARIS - LE 17e AU COEUR",
        leader: "M. Geoffroy BOULARD",
        nuance: "LUD",
        votes: "30 718",
        pct: 47.99,
      },
      {
        listName:
          "LE 17E EST A VOUS ! AVEC KARIM ZIADY ET EMMANUEL GREGOIRE L'UNION DE LA GAUCHE ET DES ECOLOGISTES",
        leader: "M. Karim ZIADY",
        nuance: "LUG",
        votes: "12 577",
        pct: 19.65,
      },
      {
        listName: "Paris 17e Apaise avec Rachel-Flore PARDO",
        leader: "Mme Rachel-Flore PARDO",
        nuance: "LUC",
        votes: "7 749",
        pct: 12.11,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Aurelie ASSOULINE",
        nuance: "LEXD",
        votes: "5 931",
        pct: 9.27,
      },
      {
        listName: "LE NOUVEAU POPULAIRE 17e",
        leader: "Mme Fanta MARENA",
        nuance: "LFI",
        votes: "5 515",
        pct: 8.62,
      },
    ],
  },
  {
    id: "18",
    officialLabel: "Paris 18eme secteur (75056SR18)",
    lists: [
      {
        listName:
          "Le 18e est a vous ! Avec Eric Lejoindre et Emmanuel Gregoire. L'union de la gauche et des ecologistes",
        leader: "M. Eric LEJOINDRE",
        nuance: "LUG",
        votes: "21 281",
        pct: 33.46,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 18e",
        leader: "Mme Daniele OBONO",
        nuance: "LFI",
        votes: "12 543",
        pct: 19.72,
      },
      {
        listName: "Changer Paris 18 avecThierry Guerrier et Rachida Dati",
        leader: "M. Thierry GUERRIER",
        nuance: "LUD",
        votes: "9 116",
        pct: 14.33,
      },
      {
        listName: "Paris 18eme apaise avec Samir BELAID",
        leader: "M. Samir BELAID",
        nuance: "LUC",
        votes: "8 093",
        pct: 12.72,
      },
      {
        listName: "LE 18E C'EST NOUS !",
        leader: "Mme Ayodele IKUESAN",
        nuance: "LDVG",
        votes: "3 600",
        pct: 5.66,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "Mme Caroline BRISARD",
        nuance: "LEXD",
        votes: "3 364",
        pct: 5.29,
      },
      {
        listName: "18e vivant et solidaire avec Aymeric Caron",
        leader: "Mme Catherine TEINTURIER",
        nuance: "LDVG",
        votes: "3 186",
        pct: 5.01,
      },
    ],
  },
  {
    id: "19",
    officialLabel: "Paris 19eme secteur (75056SR19)",
    lists: [
      {
        listName:
          "Le 19e qu'on aime ! Avec Francois Dagnaud et Emmanuel Gregoire. L'union de la gauche et des ecologistes",
        leader: "M. Francois DAGNAUD",
        nuance: "LUG",
        votes: "27 966",
        pct: 46.81,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 19e",
        leader: "M. Roland TIMSIT",
        nuance: "LFI",
        votes: "13 982",
        pct: 23.41,
      },
      {
        listName: "CHANGER PARIS 19 AVEC PIERRE LISCIA ET RACHIDA DATI",
        leader: "M. Pierre LISCIA",
        nuance: "LUD",
        votes: "7 669",
        pct: 12.84,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Franck SERFATI",
        nuance: "LEXD",
        votes: "4 856",
        pct: 8.13,
      },
    ],
  },
  {
    id: "20",
    officialLabel: "Paris 20eme secteur (75056SR20)",
    lists: [
      {
        listName:
          "Le 20e est a vous! Avec Eric Pliez et Emmanuel Gregoire L'union de la gauche et des ecologistes",
        leader: "M. Eric PLIEZ",
        nuance: "LUG",
        votes: "31 594",
        pct: 46.72,
      },
      {
        listName: "LE NOUVEAU PARIS POPULAIRE 20e",
        leader: "Mme Sophie DE LA ROCHEFOUCAULD",
        nuance: "LFI",
        votes: "14 926",
        pct: 22.07,
      },
      {
        listName: "CHANGER PARIS 20 AVEC FRANCOIS-MARIE DIDIER ET RACHIDA DATI",
        leader: "M. Francois-Marie DIDIER",
        nuance: "LUD",
        votes: "8 551",
        pct: 12.65,
      },
      {
        listName: "PARIS 20 APAISE AVEC MOHAMAD GASSAMA",
        leader: "M. Mohamad GASSAMA",
        nuance: "LUC",
        votes: "4 713",
        pct: 6.97,
      },
      {
        listName: "Sarah Knafo pour Paris - Une ville heureuse",
        leader: "M. Mourad AMELLAL",
        nuance: "LEXD",
        votes: "3 819",
        pct: 5.65,
      },
    ],
  },
];

export const PARIS_SECTOR_LAYOUT: SectorLayoutItem[] = [
  { sectorId: "17", x: 26, y: 26, width: 82, height: 56, label: "17e" },
  { sectorId: "18", x: 116, y: 12, width: 82, height: 64, label: "18e" },
  { sectorId: "19", x: 206, y: 24, width: 86, height: 60, label: "19e" },
  { sectorId: "08", x: 44, y: 96, width: 70, height: 52, label: "8e" },
  { sectorId: "09", x: 122, y: 84, width: 72, height: 52, label: "9e" },
  { sectorId: "10", x: 204, y: 96, width: 72, height: 52, label: "10e" },
  { sectorId: "01", x: 122, y: 146, width: 84, height: 62, label: "1-4" },
  { sectorId: "16", x: 10, y: 156, width: 94, height: 84, label: "16e" },
  { sectorId: "11", x: 214, y: 154, width: 88, height: 68, label: "11e" },
  { sectorId: "07", x: 74, y: 156, width: 44, height: 62, label: "7e" },
  { sectorId: "06", x: 90, y: 218, width: 44, height: 44, label: "6e" },
  { sectorId: "05", x: 136, y: 214, width: 48, height: 40, label: "5e" },
  { sectorId: "15", x: 18, y: 246, width: 92, height: 108, label: "15e" },
  { sectorId: "20", x: 216, y: 234, width: 92, height: 92, label: "20e" },
  { sectorId: "12", x: 206, y: 330, width: 92, height: 72, label: "12e" },
  { sectorId: "14", x: 94, y: 274, width: 70, height: 92, label: "14e" },
  { sectorId: "13", x: 132, y: 330, width: 70, height: 84, label: "13e" },
];

const SECTOR_METADATA: Record<string, { label: string; arrondissementLabel: string }> = {
  "01": { label: "Secteur Centre", arrondissementLabel: "1er, 2e, 3e et 4e arrondissements" },
  "05": { label: "5e arrondissement", arrondissementLabel: "5e arrondissement" },
  "06": { label: "6e arrondissement", arrondissementLabel: "6e arrondissement" },
  "07": { label: "7e arrondissement", arrondissementLabel: "7e arrondissement" },
  "08": { label: "8e arrondissement", arrondissementLabel: "8e arrondissement" },
  "09": { label: "9e arrondissement", arrondissementLabel: "9e arrondissement" },
  "10": { label: "10e arrondissement", arrondissementLabel: "10e arrondissement" },
  "11": { label: "11e arrondissement", arrondissementLabel: "11e arrondissement" },
  "12": { label: "12e arrondissement", arrondissementLabel: "12e arrondissement" },
  "13": { label: "13e arrondissement", arrondissementLabel: "13e arrondissement" },
  "14": { label: "14e arrondissement", arrondissementLabel: "14e arrondissement" },
  "15": { label: "15e arrondissement", arrondissementLabel: "15e arrondissement" },
  "16": { label: "16e arrondissement", arrondissementLabel: "16e arrondissement" },
  "17": { label: "17e arrondissement", arrondissementLabel: "17e arrondissement" },
  "18": { label: "18e arrondissement", arrondissementLabel: "18e arrondissement" },
  "19": { label: "19e arrondissement", arrondissementLabel: "19e arrondissement" },
  "20": { label: "20e arrondissement", arrondissementLabel: "20e arrondissement" },
};

const DIRECT_CANDIDATE_MATCH: Record<string, CitywideCandidateId> = {
  "Rachida Dati": "rachida-dati",
  "Sarah Knafo": "sarah-knafo",
  "David Belliard": "david-belliard",
};

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(?:^|[\s'’-])\p{L}/gu, (match) => match.toUpperCase());
}

function stripHonorific(value: string): string {
  return value
    .replace(/^(?:m(?:me|lle)?|madame|monsieur)\.?\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toDisplayName(rawName: string): string {
  return toTitleCase(stripHonorific(rawName));
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferLeadCandidateId(displayName: string): CitywideCandidateId | undefined {
  return DIRECT_CANDIDATE_MATCH[displayName];
}

function getLeaderPhotoUrl(displayName: string): string | undefined {
  return ARRONDISSEMENT_LEADER_PHOTOS[displayName];
}

function inferSponsorCandidateId(
  listName: string,
  nuance: string,
): CitywideCandidateId | undefined {
  const normalizedList = normalizeText(listName);

  if (normalizedList.includes("emmanuel gregoire")) return "emmanuel-gregoire";
  if (normalizedList.includes("rachida dati")) return "rachida-dati";
  if (normalizedList.includes("sarah knafo")) return "sarah-knafo";
  if (normalizedList.includes("david belliard")) return "david-belliard";
  if (normalizedList.includes("nouveau paris populaire") || nuance === "LFI") {
    return "sophia-chikirou";
  }
  if (normalizedList.includes("apaise")) return "pierre-yves-bournazel";
  return undefined;
}

function inferTone(listName: string, nuance: string): PreviewPoliticalTone {
  const normalizedList = normalizeText(listName);

  if (normalizedList.includes("sarah knafo") || nuance === "LEXD") return "far-right";
  if (normalizedList.includes("nouveau paris populaire") || nuance === "LFI") return "left";
  if (normalizedList.includes("apaise") || normalizedList.includes("apaise")) return "center";
  if (nuance === "LUG") return "left";
  if (nuance === "LUD") return "right";
  if (nuance === "LDVG") return "left-independent";
  if (nuance === "LDVD") return "right-independent";
  if (nuance === "LDVC") return "centrist-independent";
  return "center";
}

function inferBlocLabels(
  listName: string,
  nuance: string,
): Pick<PreviewSectorList, "shortBlocLabel" | "blocLabel"> {
  const normalizedList = normalizeText(listName);

  if (normalizedList.includes("sarah knafo") || nuance === "LEXD") {
    return { shortBlocLabel: "Reconquête", blocLabel: "Bloc Reconquête" };
  }
  if (normalizedList.includes("nouveau paris populaire") || nuance === "LFI") {
    return { shortBlocLabel: "LFI", blocLabel: "La France insoumise" };
  }
  if (nuance === "LUG") {
    return {
      shortBlocLabel: "Union gauche-écolos (PS)",
      blocLabel: "Union de la gauche et des écologistes",
    };
  }
  if (nuance === "LUD") {
    return { shortBlocLabel: "LR + alliés", blocLabel: "Droite et centre autour de Rachida Dati" };
  }
  if (normalizedList.includes("apaise")) {
    return { shortBlocLabel: "Horizons", blocLabel: "Bloc Paris apaisé / centre" };
  }
  if (nuance === "LDVG") {
    return { shortBlocLabel: "Divers gauche", blocLabel: "Liste divers gauche" };
  }
  if (nuance === "LDVD") {
    return { shortBlocLabel: "Divers droite", blocLabel: "Liste divers droite" };
  }
  if (nuance === "LDVC") {
    return { shortBlocLabel: "Centre ind.", blocLabel: "Liste centriste indépendante" };
  }
  if (nuance === "LUC") {
    return { shortBlocLabel: "Droite + centre", blocLabel: "Union locale de la droite et du centre" };
  }
  return { shortBlocLabel: nuance, blocLabel: `Bloc ${nuance}` };
}

const KNOWN_LEADER_BIOS: Record<string, string> = {
  "Ariel Weil":
    "Economiste et elu local parisien, maire de Paris Centre depuis 2020 apres avoir dirige le 4e arrondissement.",
  "Florence Berthout":
    "Elue de droite, maire du 5e arrondissement depuis 2014 et conseillere de Paris.",
  "Jean-Pierre Lecoq":
    "Elu LR, maire du 6e arrondissement depuis 1995 et figure installee de la droite parisienne.",
  "Rachida Dati":
    "Ministre de la Culture et maire du 7e arrondissement, ancienne garde des Sceaux et figure nationale de la droite.",
  "David Belliard":
    "Elu ecologiste parisien, adjoint a la maire de Paris en charge des mobilites depuis 2020.",
  "Jerome Coumet":
    "Maire du 13e arrondissement depuis 2007, elu socialiste actif sur les sujets urbains et de transition.",
  "Philippe Goujon":
    "Maire du 15e arrondissement, elu LR de longue date et ancien depute de Paris.",
  "Geoffroy Boulard":
    "Elu LR, maire du 17e arrondissement depuis 2017 et conseiller de Paris.",
  "Eric Lejoindre":
    "Elu socialiste, maire du 18e arrondissement depuis 2014 et conseiller de Paris.",
  "Francois Dagnaud":
    "Elu socialiste, maire du 19e arrondissement depuis 2013 et ancien vice-president du departement de Paris.",
  "Eric Pliez":
    "Maire du 20e arrondissement depuis 2020, ancien dirigeant associatif engage sur les questions sociales.",
  "Jeremy Redler":
    "Elu LR, maire du 16e arrondissement depuis 2023 et conseiller de Paris.",
  "Lucie Castets":
    "Haute fonctionnaire issue des finances publiques, figure de la gauche sociale connue au plan national depuis 2024.",
  "Sarah Knafo":
    "Figure de Reconquete, depute europeenne et candidate recurrente a Paris sur une ligne de droite identitaire.",
  "Emmanuel Gregoire":
    "Depute de Paris et ancien premier adjoint d'Anne Hidalgo, figure du Parti socialiste parisien.",
};

function buildLeadBio(
  leadName: string,
  sectorLabel: string,
  _listName: string,
  _qualificationStatus: PreviewQualificationStatus,
  blocLabel: string,
): string {
  const blocLabelWithoutPrefix = blocLabel.replace(/^bloc\s+/i, "").trim();

  const knownBio = KNOWN_LEADER_BIOS[leadName];
  if (knownBio) {
    return `${knownBio} Sur cette election, ${leadName} conduit une liste rattachee au bloc ${blocLabelWithoutPrefix} dans le ${sectorLabel}.`;
  }
  return `${leadName} est tete de liste dans le ${sectorLabel} pour les municipales 2026. Cette candidature est rattachee au bloc ${blocLabelWithoutPrefix}.`;
}

function buildSupportBio(name: string, sectorLabel: string): string {
  const knownBio = KNOWN_LEADER_BIOS[name];
  if (knownBio) {
    return `${knownBio} Sur cette carte, son image sert de repere pour cette liste dans le ${sectorLabel}.`;
  }
  return `${name} sert ici de repere politique parisien pour cette liste dans le ${sectorLabel}.`;
}

function buildQualificationNote(status: PreviewQualificationStatus): string {
  return status === "maintain"
    ? "Au-dessus de 10 % : maintien possible ou fusion"
    : "Entre 5 % et 10 % : fusion possible uniquement";
}

function buildListSummary(
  leadName: string,
  blocLabel: string,
  qualificationStatus: PreviewQualificationStatus,
  sponsorCandidateId?: CitywideCandidateId,
): string {
  const sponsorText = sponsorCandidateId
    ? ` Appui parisien associe : ${CITYWIDE_CANDIDATES[sponsorCandidateId]}.`
    : "";

  return qualificationStatus === "maintain"
    ? `${leadName} conduit une liste issue de ${blocLabel.toLowerCase()}. Cette liste est pour l'instant affichée comme encore en lice.${sponsorText}`
    : `${leadName} conduit une liste au-dessus de 5 % mais sous le seuil de maintien. Elle peut servir de base à une fusion.${sponsorText}`;
}

function buildFigures(
  sectorLabel: string,
  leadName: string,
  listName: string,
  qualificationStatus: PreviewQualificationStatus,
  blocLabel: string,
  sponsorCandidateId?: CitywideCandidateId,
): PreviewFigure[] {
  const leadFigure: PreviewFigure = {
    id: `${slugify(sectorLabel)}-${slugify(leadName)}`,
    name: leadName,
    role: "Tête de liste locale",
    bio: buildLeadBio(leadName, sectorLabel, listName, qualificationStatus, blocLabel),
    shortPartyLabel: blocLabel,
    partyLabel: blocLabel,
    candidateId: inferLeadCandidateId(leadName),
    photoUrl: getLeaderPhotoUrl(leadName),
    isLead: true,
  };

  if (!sponsorCandidateId) {
    return [leadFigure];
  }

  return [
    leadFigure,
    {
      id: `${slugify(sectorLabel)}-${sponsorCandidateId}`,
      name: CITYWIDE_CANDIDATES[sponsorCandidateId],
      role: "Figure parisienne associée",
      bio: buildSupportBio(CITYWIDE_CANDIDATES[sponsorCandidateId], sectorLabel),
      shortPartyLabel: blocLabel,
      partyLabel: blocLabel,
      candidateId: sponsorCandidateId,
    },
  ];
}

function buildSectorList(
  sector: RawSectorResult,
  list: RawSectorResult["lists"][number],
): PreviewSectorList {
  const sectorMeta = SECTOR_METADATA[sector.id];
  const leadName = toDisplayName(list.leader);
  const qualificationStatus: PreviewQualificationStatus = list.pct >= 10 ? "maintain" : "merge";
  const sponsorCandidateId = inferSponsorCandidateId(list.listName, list.nuance);
  const tone = inferTone(list.listName, list.nuance);
  const labels = inferBlocLabels(list.listName, list.nuance);

  return {
    id: `${sector.id}-${slugify(leadName)}`,
    listName: list.listName,
    shortBlocLabel: labels.shortBlocLabel,
    blocLabel: labels.blocLabel,
    tone,
    qualificationStatus,
    qualificationNote: buildQualificationNote(qualificationStatus),
    listSummary: buildListSummary(
      leadName,
      labels.blocLabel,
      qualificationStatus,
      sponsorCandidateId,
    ),
    votes: list.votes,
    pct: list.pct,
    figures: buildFigures(
      sectorMeta.label,
      leadName,
      list.listName,
      qualificationStatus,
      labels.blocLabel,
      sponsorCandidateId,
    ),
    firstRoundContributions: [
      {
        label: list.listName,
        pct: list.pct,
        votes: list.votes,
        note: `${leadName} menait cette liste au 1er tour.`,
      },
    ],
  };
}

export const PARIS_SECOND_ROUND_PREVIEW: PreviewSector[] = RAW_SECTOR_RESULTS.map((sector) => {
  const sectorMeta = SECTOR_METADATA[sector.id];

  return {
    id: sector.id,
    mapLabel: sector.id === "01" ? "Paris Centre" : `${Number(sector.id)}e`,
    label: sectorMeta.label,
    arrondissementLabel: sectorMeta.arrondissementLabel,
    officialLabel: sector.officialLabel,
    sourceUrl: `${OFFICIAL_SOURCE_BASE_URL}/75056SR${sector.id}/index.html`,
    lists: sector.lists
      .map((list) => buildSectorList(sector, list))
      .sort((left, right) => right.pct - left.pct),
  };
});

type CitywideAggregate = {
  key: string;
  listName: string;
  leadName: string;
  shortBlocLabel: string;
  blocLabel: string;
  tone: PreviewPoliticalTone;
  sponsorCandidateId?: CitywideCandidateId;
  votes: number;
  strongestLocalVotes: number;
};

function parseVotes(votes: string): number {
  const cleaned = votes.replace(/\s+/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatVotes(votes: number): string {
  return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const PARIS_CITY_HALL_PREVIEW: PreviewSector = (() => {
  const aggregates = new Map<string, CitywideAggregate>();

  for (const sector of RAW_SECTOR_RESULTS) {
    for (const list of sector.lists) {
      const labels = inferBlocLabels(list.listName, list.nuance);
      const tone = inferTone(list.listName, list.nuance);
      const sponsorCandidateId = inferSponsorCandidateId(list.listName, list.nuance);
      const leadName = toDisplayName(list.leader);
      const key = `${labels.shortBlocLabel}-${tone}`;
      const votes = parseVotes(list.votes);
      const current = aggregates.get(key);

      if (!current) {
        aggregates.set(key, {
          key,
          listName: list.listName,
          leadName,
          shortBlocLabel: labels.shortBlocLabel,
          blocLabel: labels.blocLabel,
          tone,
          sponsorCandidateId,
          votes,
          strongestLocalVotes: votes,
        });
        continue;
      }

      current.votes += votes;
      if (sponsorCandidateId && !current.sponsorCandidateId) {
        current.sponsorCandidateId = sponsorCandidateId;
      }
      if (votes > current.strongestLocalVotes) {
        current.leadName = leadName;
        current.listName = list.listName;
        current.strongestLocalVotes = votes;
      }
    }
  }

  const totalVotes = Array.from(aggregates.values()).reduce(
    (sum, aggregate) => sum + aggregate.votes,
    0,
  );

  const lists: PreviewSectorList[] = Array.from(aggregates.values())
    .map((aggregate) => {
      const pct = totalVotes > 0 ? (aggregate.votes / totalVotes) * 100 : 0;
      const qualificationStatus: PreviewQualificationStatus = pct >= 10 ? "maintain" : "merge";
      const leadName = aggregate.sponsorCandidateId
        ? CITYWIDE_CANDIDATES[aggregate.sponsorCandidateId]
        : aggregate.leadName;
      const figures: PreviewFigure[] = [
        {
          id: `mairie-paris-${slugify(leadName)}`,
          name: leadName,
          role: "Tête de liste parisienne",
          bio: buildLeadBio(
            leadName,
            "Mairie de Paris",
            aggregate.listName,
            qualificationStatus,
            aggregate.blocLabel,
          ),
          shortPartyLabel: aggregate.blocLabel,
          partyLabel: aggregate.blocLabel,
          candidateId: aggregate.sponsorCandidateId,
          photoUrl: getLeaderPhotoUrl(leadName),
          isLead: true,
        },
      ];

      return {
        id: `mairie-paris-${slugify(aggregate.key)}`,
        listName: aggregate.listName,
        shortBlocLabel: aggregate.shortBlocLabel,
        blocLabel: aggregate.blocLabel,
        tone: aggregate.tone,
        qualificationStatus,
        qualificationNote: buildQualificationNote(qualificationStatus),
        listSummary: buildListSummary(
          leadName,
          aggregate.blocLabel,
          qualificationStatus,
          aggregate.sponsorCandidateId,
        ),
        votes: formatVotes(aggregate.votes),
        pct,
        figures,
        firstRoundContributions: [
          {
            label: "Agrégation des résultats d'arrondissements",
            pct,
            votes: formatVotes(aggregate.votes),
            note: "Synthèse locale utilisée pour un aperçu de la dynamique parisienne.",
          },
        ],
      };
    })
    .sort((left, right) => right.pct - left.pct)
    .slice(0, 6);

  return {
    id: "mairie-paris",
    mapLabel: "Mairie",
    label: "Mairie de Paris",
    arrondissementLabel: "Vue Paris (agrégée)",
    officialLabel: "Synthèse parisienne",
    sourceUrl:
      "https://www.resultats-elections.interieur.gouv.fr/municipales2026/ensemble_geographique/11/75/75056/index.html",
    lists,
  };
})();

export function getPreviewSectorById(sectorId: string): PreviewSector | undefined {
  return PARIS_SECOND_ROUND_PREVIEW.find((sector) => sector.id === sectorId);
}

export function getParisCityHallPreview(): PreviewSector {
  return PARIS_CITY_HALL_PREVIEW;
}
