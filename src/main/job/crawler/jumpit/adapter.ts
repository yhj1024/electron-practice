import { IAdapter, JobPosting } from '../common/types'
import { JumpitRawJob } from './types'

/**
 * 점핏 어댑터
 * 점핏 원본 데이터를 통일된 JobPosting 형식으로 변환
 */
export class JumpitAdapter implements IAdapter<JumpitRawJob> {
  /**
   * 원본 데이터를 통일된 형식으로 변환
   * @param raw 점핏 원본 데이터
   * @returns 통일된 채용 공고 객체
   */
  adapt(raw: JumpitRawJob): JobPosting {
    // locations 배열에서 서울 지역 우선 선택 (경기도 등 제외)
    const seoulLocation = raw.locations.find(loc => loc.startsWith('서울'))
    const location = seoulLocation || raw.locations[0]

    // 경력 요구사항 생성
    const experience =
      raw.newcomer && raw.minCareer === 0
        ? '신입'
        : raw.minCareer === raw.maxCareer
          ? `${raw.minCareer}년`
          : `${raw.minCareer}~${raw.maxCareer}년`

    return {
      id: `jumpit-${raw.id}`,
      source: 'jumpit',
      title: raw.title,
      company: raw.companyName,
      url: `https://jumpit.saramin.co.kr/position/${raw.id}`,
      location,
      requirements: {
        experience,
      },
      crawledAt: new Date().toISOString(),
      rawData: raw, // 원본 데이터 보관
    }
  }
}
