import { IAdapter, JobPosting } from '../common/types'
import { JumpitRawJob } from './types'

/**
 * 점핏(Jumpit) 어댑터
 * 점핏 원본 데이터를 통일된 JobPosting 형식으로 변환
 */
export class JumpitAdapter implements IAdapter<JumpitRawJob> {
  /**
   * 원본 데이터를 통일된 형식으로 변환
   * @param raw 점핏 원본 데이터
   * @returns 통일된 채용 공고 객체
   */
  adapt(raw: JumpitRawJob): JobPosting {
    return {
      id: `jumpit-${raw.id}`,
      source: 'jumpit',
      title: raw.title,
      company: raw.company,
      url: raw.url,
      imageUrl: raw.imageUrl,
      location: raw.location,
      requirements: {
        experience: raw.experience,
        employmentType: raw.employmentType,
      },
      crawledAt: new Date().toISOString(),
      rawData: raw, // 원본 데이터 보관
    }
  }
}
