import { IAdapter, JobPosting } from '../common/types'
import { SaraminRawJob } from './types'

/**
 * 사람인 어댑터
 * 사람인 원본 데이터를 통일된 JobPosting 형식으로 변환
 */
export class SaraminAdapter implements IAdapter<SaraminRawJob> {
  /**
   * 원본 데이터를 통일된 형식으로 변환
   * @param raw 사람인 원본 데이터
   * @returns 통일된 채용 공고 객체
   */
  adapt(raw: SaraminRawJob): JobPosting {
    return {
      id: `saramin-${raw.id}`,
      source: 'saramin',
      title: raw.title,
      company: raw.company,
      url: raw.url,
      imageUrl: raw.imageUrl,
      location: raw.location,
      requirements: {
        experience: raw.experience,
        education: raw.education,
        employmentType: raw.employmentType,
      },
      crawledAt: new Date().toISOString(),
      rawData: raw, // 원본 데이터 보관
    }
  }
}
