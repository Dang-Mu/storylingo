#!/usr/bin/env python3
"""
pos_split_results.json을 기반으로 data/ 폴더의 스토리 파일들을 확장합니다.
- partOfSpeech 필드 추가
- wrongAnswers 필드 추가 (같은 품사의 다른 단어들)
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Set
import re

# 프로젝트 루트 디렉토리
ROOT_DIR = Path(__file__).parent.parent
POS_RESULTS_FILE = ROOT_DIR / "utils" / "pos_split_results.json"
DATA_DIR = ROOT_DIR / "data"
PUBLIC_DATA_DIR = ROOT_DIR / "public" / "data"

def normalize_word(word: str) -> str:
    """단어를 정규화 (소문자, 구두점 제거)"""
    # 구두점 제거
    word = re.sub(r'[^\w\s]', '', word)
    return word.lower().strip()

def find_word_pos(word: str, pos_breakdown: Dict[str, List[str]]) -> Optional[str]:
    """단어가 어떤 품사인지 찾기"""
    normalized_word = normalize_word(word)
    
    # 각 품사별로 검색
    for pos, words in pos_breakdown.items():
        for w in words:
            if normalize_word(w) == normalized_word:
                # 우리가 사용하는 품사 타입으로 매핑
                if pos == "noun":
                    return "noun"
                elif pos == "verb":
                    return "verb"
                elif pos == "adjective":
                    return "adjective"
                elif pos == "adverb":
                    return "adverb"
    
    return None

def get_wrong_answers(target_word: str, pos: Optional[str], pos_breakdown: Dict[str, List[str]], all_sentences: List[Dict]) -> List[str]:
    """같은 품사의 다른 단어들을 오답으로 생성"""
    if not pos:
        return []
    
    wrong_answers = []
    normalized_target = normalize_word(target_word)
    
    # 현재 스토리의 모든 문장에서 같은 품사의 단어들 수집
    candidate_words: Set[str] = set()
    
    for sentence_data in all_sentences:
        pos_breakdown = sentence_data.get("pos_breakdown", {})
        pos_words = pos_breakdown.get(pos, [])
        
        for word in pos_words:
            normalized = normalize_word(word)
            if normalized != normalized_target and normalized and len(normalized) > 1:
                candidate_words.add(normalized)
    
    # 후보 단어들을 리스트로 변환하고 정렬 (일관성을 위해)
    candidate_list = sorted(list(candidate_words))
    
    # 정답과 다른 단어들 중에서 3개 선택
    for word in candidate_list:
        if len(wrong_answers) >= 3:
            break
        if word != normalized_target:
            wrong_answers.append(word)
    
    # 3개가 안 되면 기본 오답 추가
    default_wrongs = {
        "noun": ["thing", "place", "person", "object", "item"],
        "verb": ["do", "make", "get", "take", "go"],
        "adjective": ["good", "bad", "big", "small", "new"],
        "adverb": ["well", "badly", "quickly", "slowly", "carefully"]
    }
    
    if len(wrong_answers) < 3 and pos in default_wrongs:
        for word in default_wrongs[pos]:
            if len(wrong_answers) >= 3:
                break
            normalized = normalize_word(word)
            if normalized != normalized_target and normalized not in wrong_answers:
                wrong_answers.append(normalized)
    
    return wrong_answers[:3]

def enhance_story_file(story_filename: str, pos_data: Dict) -> bool:
    """단일 스토리 파일을 확장"""
    story_file = DATA_DIR / story_filename
    public_story_file = PUBLIC_DATA_DIR / story_filename
    
    if not story_file.exists():
        print(f"⚠️  {story_filename} 파일을 찾을 수 없습니다.")
        return False
    
    # JSON 파일 읽기
    try:
        with open(story_file, 'r', encoding='utf-8') as f:
            story_data = json.load(f)
    except Exception as e:
        print(f"❌ {story_filename} 읽기 실패: {e}")
        return False
    
    # pos_split_results에서 해당 스토리 데이터 찾기
    if story_filename not in pos_data:
        print(f"⚠️  {story_filename}에 대한 품사 분석 데이터가 없습니다.")
        return False
    
    analyzed_data = pos_data[story_filename]
    analyzed_sentences = analyzed_data.get("analyzed_sentences", [])
    
    # 문장 매칭 및 확장
    enhanced_count = 0
    
    for sentence in story_data.get("sentences", []):
        english = sentence.get("english", "")
        target_word = sentence.get("targetWordEnglish", "")
        
        if not target_word:
            continue
        
        # analyzed_sentences에서 매칭되는 문장 찾기
        matched_analysis = None
        for analyzed in analyzed_sentences:
            if analyzed.get("original_english", "").strip() == english.strip():
                matched_analysis = analyzed
                break
        
        if not matched_analysis:
            # 정확히 일치하지 않으면 부분 매칭 시도
            for analyzed in analyzed_sentences:
                analyzed_english = analyzed.get("original_english", "")
                # 문장의 주요 부분이 일치하는지 확인
                if target_word.lower() in analyzed_english.lower():
                    matched_analysis = analyzed
                    break
        
        if matched_analysis:
            pos_breakdown = matched_analysis.get("pos_breakdown", {})
            
            # 품사 찾기
            pos = find_word_pos(target_word, pos_breakdown)
            if pos:
                sentence["partOfSpeech"] = pos
                enhanced_count += 1
            
            # 오답 생성
            wrong_answers = get_wrong_answers(
                target_word, 
                pos, 
                pos_breakdown,
                analyzed_sentences
            )
            
            if wrong_answers:
                sentence["wrongAnswers"] = wrong_answers
    
    # 업데이트된 파일 저장
    try:
        with open(story_file, 'w', encoding='utf-8') as f:
            json.dump(story_data, f, ensure_ascii=False, indent=2)
        
        # public/data 폴더에도 복사
        if public_story_file.parent.exists():
            with open(public_story_file, 'w', encoding='utf-8') as f:
                json.dump(story_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {story_filename}: {enhanced_count}개 문장 확장 완료")
        return True
    except Exception as e:
        print(f"❌ {story_filename} 저장 실패: {e}")
        return False

def main():
    """메인 함수"""
    print("📚 스토리 파일 확장 시작...\n")
    
    # pos_split_results.json 읽기
    if not POS_RESULTS_FILE.exists():
        print(f"❌ {POS_RESULTS_FILE} 파일을 찾을 수 없습니다.")
        return
    
    try:
        with open(POS_RESULTS_FILE, 'r', encoding='utf-8') as f:
            pos_data = json.load(f)
    except Exception as e:
        print(f"❌ pos_split_results.json 읽기 실패: {e}")
        return
    
    # data 폴더의 모든 JSON 파일 처리
    story_files = sorted(DATA_DIR.glob("*.json"))
    
    if not story_files:
        print("⚠️  data 폴더에 JSON 파일이 없습니다.")
        return
    
    success_count = 0
    total_count = len(story_files)
    
    for story_file in story_files:
        filename = story_file.name
        if enhance_story_file(filename, pos_data):
            success_count += 1
        print()
    
    print(f"✨ 완료: {success_count}/{total_count}개 파일 확장 성공")

if __name__ == "__main__":
    main()
