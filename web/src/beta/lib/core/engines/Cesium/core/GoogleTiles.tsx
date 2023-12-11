/* eslint-disable prettier/prettier */
import { GoogleMaps, createGooglePhotorealistic3DTileset, Cesium3DTileset as Cesium3DTilesetType, } from 'cesium'
import { useCallback, useEffect, useRef, useState } from 'react';
import { Cesium3DTileset, CesiumComponentRef } from 'resium';

import { attachTag } from '../Feature/utils';

export type Props = {
    gmapKey?: string;
};

export default function ReearthClock({ gmapKey }: Props): JSX.Element | null {
    GoogleMaps.defaultApiKey = gmapKey || 'AIzaSyCBt4diigz9Zo1Yd_CCw6J6AXeqH2UqH5c';
    GoogleMaps.mapTilesApiEndpoint = 'https://tile.googleapis.com/v1/3dtiles/root.json'.split('3dtiles/')[0];
    const [url, setUrl] = useState<string>();
    const tilesetRef = useRef<Cesium3DTilesetType>();

    const ref = useCallback(
        (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
            if (tileset?.cesiumElement) {
                attachTag(tileset.cesiumElement, { layerId: 'googleTile', featureId: undefined });
            }
            (tileset?.cesiumElement as any)['__reearth_layer_id'] = 'googleTile';
            tilesetRef.current = tileset?.cesiumElement;
        },
        [],
    );
    useEffect(() => {
        (async () => {
            const res = await createGooglePhotorealistic3DTileset(GoogleMaps.defaultApiKey);
            setUrl(res.resource.url);
        })();
    }, []);
    return (
        <>
            <Cesium3DTileset
                ref={ref}
                key={'googleTile'}
                url={url}
                showCreditsOnScreen={true}
            />,
        </>
    );
}
/* eslint-disable prettier/prettier */
// import { GoogleMaps, createGooglePhotorealistic3DTileset } from 'cesium'
// import { useEffect } from 'react';
// import { useCesium} from 'resium';

// export type Props = {
//     gmapKey?: string;
// };

// export default function ReearthClock({ gmapKey }: Props): JSX.Element | null {
//     GoogleMaps.defaultApiKey = gmapKey || 'AIzaSyCBt4diigz9Zo1Yd_CCw6J6AXeqH2UqH5c';
//     GoogleMaps.mapTilesApiEndpoint = 'https://tile.googleapis.com/v1/3dtiles/root.json'.split('3dtiles/')[0];
//     const { viewer } = useCesium();

//     useEffect(() => {
//         (async () => {
//             const res = await createGooglePhotorealistic3DTileset(GoogleMaps.defaultApiKey);
//             res.id = 9999;
//             viewer?.scene.primitives.add(res);
//             //setUrl(res.resource.url);
//         })();
//     }, []);
//     return (
//         <>
//         </>
//     );
// }