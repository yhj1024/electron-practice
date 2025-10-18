import { IAdapter, JobPosting } from '../common/types'
import { WantedRawJob } from './types'

/**
 * 원티드 어댑터
 * 원티드 원본 데이터를 통일된 JobPosting 형식으로 변환
 */
export class WantedAdapter implements IAdapter<WantedRawJob> {
  /**
   * 원본 데이터를 통일된 형식으로 변환
   * @param raw 원티드 원본 데이터
   * @returns 통일된 채용 공고 객체
   */
  adapt(raw: WantedRawJob): JobPosting {
    return {
      id: `wanted-${raw.id}`,
      source: 'wanted',
      title: raw.position,
      company: raw.company.name,
      url: `https://www.wanted.co.kr/wd/${raw.id}`,
      imageUrl: raw.title_img.thumb,
      location: `${raw.address.location} ${raw.address.district}`,
      requirements: {
        experience: `${raw.annual_from}~${raw.annual_to}년`,
        employmentType: raw.employment_type,
      },
      crawledAt: new Date().toISOString(),
      rawData: raw, // 원본 데이터 보관
    }
  }
}
