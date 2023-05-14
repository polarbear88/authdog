import path from 'path';
import ip2region from './ip2region';
import { IPAddrAscriptionPlace } from 'src/common/dto/ipaddr-ascription-place';

export class Ip2RegionHelpers {
    private static xdbFilePath = path.resolve(path.join(__dirname, '../../../', '/ip2region.xdb'));
    private static vectorIndex = ip2region.loadVectorIndexFromFile(this.xdbFilePath);
    private static searcher = ip2region.newWithVectorIndex(this.xdbFilePath, this.vectorIndex);

    public static async getRegion(ip: string) {
        const data = await this.searcher.search(ip);
        if (data && data.region) {
            const result = (data.region as string).split('|');
            if (result.length >= 5) {
                const iap = new IPAddrAscriptionPlace();
                iap.country = result[0];
                iap.city = result[3];
                iap.district = result[2];
                iap.isp = result[4];
                iap.region = result[2];
                return iap;
            }
        }
        return null;
    }
}
