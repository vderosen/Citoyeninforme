import type { ImageSourcePropType } from "react-native";

const PARTY_LOGOS: Record<string, ImageSourcePropType> = {
    "emmanuel-gregoire": require("../../assets/images/parties/ps.png"),
    "sophia-chikirou": require("../../assets/images/parties/lfi.png"),
    "rachida-dati": require("../../assets/images/parties/lr.png"),
    "pierre-yves-bournazel": require("../../assets/images/parties/horizon.jpg"),
    "sarah-knafo": require("../../assets/images/parties/reconquete.webp"),
    "thierry-mariani": require("../../assets/images/parties/rn.png"),
};

export function getCandidatePartyLogo(candidateId: string): ImageSourcePropType | null {
    return PARTY_LOGOS[candidateId] ?? null;
}
