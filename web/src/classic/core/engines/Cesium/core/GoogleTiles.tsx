/* eslint-disable prettier/prettier */
import { GoogleMaps, createGooglePhotorealistic3DTileset } from 'cesium'
import { useEffect } from 'react';
import { useCesium } from 'resium';

export type Props = {
    gmapKey?: string;
};

export default function ReearthClock({ gmapKey }: Props): JSX.Element | null {
    GoogleMaps.defaultApiKey = gmapKey || 'AIzaSyCBt4diigz9Zo1Yd_CCw6J6AXeqH2UqH5c';
    GoogleMaps.mapTilesApiEndpoint = 'https://tile.googleapis.com/v1/3dtiles/root.json'.split('3dtiles/')[0];
    const { viewer } = useCesium();

    useEffect(() => {
        (async () => {
            const res = await createGooglePhotorealistic3DTileset(GoogleMaps.defaultApiKey);
            res.id = 9999;

            viewer?.scene.primitives.add(res);
            //setUrl(res.resource.url);
        })();
    }, []);
    return (
        <>
        </>
    );
}