import type { ImageSourcePropType } from "react-native";
import type { Candidate } from "../data/schema";

const LOCAL_CANDIDATE_IMAGES: Record<string, ImageSourcePropType> = {
  "david-belliard": require("../../assets/images/candidates/david-belliard.jpeg"),
  "emmanuel-gregoire": require("../../assets/images/candidates/emmanuel-gregoire.png"),
  "pierre-yves-bournazel": require("../../assets/images/candidates/pierre-yves-bournazel.png"),
  "sophia-chikirou": require("../../assets/images/candidates/sophia-chikirou.png"),
  "rachida-dati": require("../../assets/images/candidates/rachida-dati.png"),
  "sarah-knafo": require("../../assets/images/candidates/sarah-knafo.png"),
  "thierry-mariani": require("../../assets/images/candidates/thierry-mariani.png"),
};

export function getCandidateImageSource(candidate: Candidate): ImageSourcePropType | null {
  const localImage = LOCAL_CANDIDATE_IMAGES[candidate.id];
  if (localImage) return localImage;
  if (candidate.photoUrl) return { uri: candidate.photoUrl };
  return null;
}
