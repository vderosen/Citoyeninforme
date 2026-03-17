export type ParisMapArea = {
  arrondissementId: number;
  sectorId: string;
  label: string;
  path: string;
  showStroke: boolean;
};

export const PARIS_MAP_VIEWBOX = { width: 640, height: 540 } as const;

export const PARIS_MAP_AREAS: readonly ParisMapArea[] = [
  { arrondissementId: 1, sectorId: "01", label: "Louvre", showStroke: false, path: "M274.4,142.1L280.8,148.4L329.7,165.9L317.5,195.7L314.4,200.2L297.4,184.3L257.3,167.2L267.6,143.8L274.4,142.1Z" },
  { arrondissementId: 2, sectorId: "01", label: "Bourse", showStroke: false, path: "M331.1,162.2L329.7,165.9L280.8,148.4L274.4,142.1L303.4,134.5L322.3,139.2L337.7,144.2L332.2,159.2Z" },
  { arrondissementId: 3, sectorId: "01", label: "Temple", showStroke: false, path: "M360.7,150.9L367.8,167.2L372.0,194.0L355.7,188.5L344.1,178.2L327.8,171.1L337.7,144.2L360.6,150.8Z" },
  { arrondissementId: 4, sectorId: "01", label: "Hôtel-de-Ville", showStroke: false, path: "M372.0,194.0L373.5,203.5L367.2,224.7L362.2,229.2L349.5,217.0L314.4,200.2L327.8,171.1L344.1,178.2L362.2,191.6Z" },
  { arrondissementId: 5, sectorId: "05", label: "Panthéon", showStroke: true, path: "M362.2,229.2L366.0,233.6L355.9,251.8L331.9,263.4L295.4,252.9L314.4,200.2L348.8,216.5L357.5,223.8Z" },
  { arrondissementId: 6, sectorId: "06", label: "Luxembourg", showStroke: true, path: "M314.4,200.2L295.4,252.9L253.1,231.5L246.9,226.7L275.4,208.4L287.1,184.8L286.2,180.8L297.4,184.3L310.2,197.2Z" },
  { arrondissementId: 7, sectorId: "07", label: "Palais-Bourbon", showStroke: true, path: "M209.1,210.7L182.5,184.9L195.1,171.2L210.8,165.7L251.8,164.6L286.2,180.8L287.1,184.8L275.4,208.4L240.0,229.9L232.3,222.4L224.6,225.5L209.3,210.5Z" },
  { arrondissementId: 8, sectorId: "08", label: "Élysée", showStroke: true, path: "M269.2,143.4L257.3,167.2L251.5,164.6L210.8,165.7L195.0,128.0L202.5,112.2L272.4,92.4L269.8,139.7Z" },
  { arrondissementId: 9, sectorId: "09", label: "Opéra", showStroke: true, path: "M302.8,97.7L326.2,91.5L322.3,139.2L303.4,134.5L269.2,143.4L272.1,128.1L272.4,92.4L277.9,88.5L302.6,97.7Z" },
  { arrondissementId: 10, sectorId: "10", label: "Entrepôt", showStroke: true, path: "M362.8,89.2L371.7,90.2L376.0,95.1L376.3,112.5L392.5,134.2L360.7,150.9L322.3,139.2L322.4,127.1L327.1,102.9L326.2,91.5L362.5,89.1Z" },
  { arrondissementId: 11, sectorId: "11", label: "Popincourt", showStroke: true, path: "M438.8,199.8L444.1,210.1L445.8,222.0L396.9,212.7L373.5,203.5L367.8,167.2L360.7,150.9L392.5,134.2L417.3,167.1L422.7,183.7L434.5,191.0L438.5,199.3Z" },
  { arrondissementId: 12, sectorId: "12", label: "Reuilly", showStroke: true, path: "M481.3,275.2L501.5,267.5L494.7,242.6L501.2,235.2L507.5,245.2L529.0,248.1L537.5,248.4L539.3,234.9L545.5,235.8L546.1,230.0L560.0,230.6L559.7,233.6L601.2,244.3L616.0,264.9L614.2,273.3L604.9,284.6L603.6,297.0L607.4,298.1L599.2,328.5L589.2,335.9L537.9,331.4L536.8,327.2L530.3,327.6L527.2,318.7L520.1,312.1L473.6,306.3L453.9,289.6L424.4,303.9L362.2,229.2L367.2,224.7L373.5,203.5L376.3,203.1L396.9,212.7L486.4,227.5L477.5,271.6L474.9,274.2L481.0,275.2Z" },
  { arrondissementId: 13, sectorId: "13", label: "Gobelins", showStroke: true, path: "M387.5,259.0L424.4,303.9L401.5,318.7L359.7,339.4L341.7,339.7L333.2,330.3L320.0,340.1L312.9,340.4L314.5,326.6L306.8,311.5L308.3,257.7L331.9,263.4L355.9,251.8L366.0,233.6L387.2,258.7Z" },
  { arrondissementId: 14, sectorId: "14", label: "Observatoire", showStroke: true, path: "M288.4,249.4L308.3,257.7L306.8,311.5L314.5,326.6L312.9,340.4L283.5,335.8L284.9,331.5L209.8,306.0L255.0,249.8L258.4,252.5L258.7,248.0L266.5,238.4L281.8,246.1Z" },
  { arrondissementId: 15, sectorId: "15", label: "Vaugirard", showStroke: true, path: "M205.3,207.1L224.6,225.5L232.3,222.4L240.0,229.9L246.9,226.7L266.5,238.4L258.7,248.0L258.4,252.5L255.0,249.8L209.8,306.0L188.2,298.8L156.4,279.3L141.3,295.9L128.9,295.8L128.2,282.8L134.8,277.3L128.1,271.3L117.7,274.0L151.5,222.2L182.5,184.9L201.9,203.8Z" },
  { arrondissementId: 16, sectorId: "16", label: "Passy", showStroke: true, path: "M144.9,111.2L152.7,112.6L158.3,110.1L195.0,128.0L210.8,165.7L198.2,169.2L187.1,179.2L148.4,226.2L117.7,274.0L98.9,270.7L90.4,255.7L89.4,241.1L92.6,231.2L68.3,223.4L60.9,214.7L24.2,202.4L26.2,186.4L34.1,159.5L43.4,143.4L63.1,135.2L75.9,118.5L98.1,126.9L107.9,104.1L137.0,109.7Z" },
  { arrondissementId: 17, sectorId: "17", label: "Batignolles-Monceau", showStroke: true, path: "M195.3,127.3L158.3,110.1L160.9,94.6L172.4,81.1L186.6,70.5L195.0,69.0L225.0,46.8L256.1,29.1L279.6,28.1L268.6,77.7L273.0,92.3L202.5,112.2L195.6,126.8Z" },
  { arrondissementId: 18, sectorId: "18", label: "Buttes-Montmartre", showStroke: true, path: "M365.5,84.9L362.8,89.2L326.2,91.5L302.9,97.8L277.9,88.5L273.0,92.3L268.6,77.7L279.6,28.1L376.3,25.1L376.6,44.3L379.9,48.7L375.7,53.8L366.4,83.4Z" },
  { arrondissementId: 19, sectorId: "19", label: "Buttes-Chaumont", showStroke: true, path: "M422.4,27.5L437.1,38.3L442.5,51.7L448.2,91.2L459.1,100.7L470.4,104.2L474.0,110.9L454.1,119.8L423.3,122.3L392.5,134.2L376.3,112.5L376.0,95.1L371.7,90.2L362.8,89.2L367.9,80.8L375.7,53.8L379.9,48.7L376.6,44.3L376.1,25.8L410.4,24.0L422.4,27.5Z" },
  { arrondissementId: 20, sectorId: "20", label: "Ménilmontant", showStroke: true, path: "M478.7,121.7L486.4,227.5L445.8,222.0L444.1,210.1L434.5,191.0L422.8,183.8L417.3,167.1L392.5,134.2L423.3,122.3L454.1,119.8L474.0,110.9L478.6,121.4Z" }
] as const;

export const PARIS_SEINE_PATH =
  "M41,248 C70,220 95,219 126,236 C152,251 183,263 214,248 C246,233 275,202 310,196 C343,191 371,213 401,235 C434,259 469,289 508,302 C538,312 566,313 598,323";
