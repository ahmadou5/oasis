import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
//import { geographies } from "../utils/features";
export const ValidatorMap = () => {
  const GEO_URL =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  return (
    <div className="overflow-hidden w-auto h-[240px] sm:h-[280px] lg:h-[620px] flex-col flex items-center  bg-green-500/10 justify-center rounded-xl border border-green-500/40">
      <ComposableMap>
        <ZoomableGroup>
          <Geographies
            projection="geoMercator"
            projectionConfig={{ scale: 120, center: [0, 25] }}
            style={{ width: "100%", height: "100%" }}
            geography={GEO_URL}
            fill="#16A34C"
            stroke="#FFFFFF"
            strokeWidth={0.5}
          >
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
