# FSRS-5（Free Spaced Repetition Scheduler v5）の純粋計算。
#
# 出題ペースを決めるアルゴリズム。状態（stability / difficulty / due_at）は
# QuestionReviewState が保持し、このモジュールは「現在の状態 + 正誤 →
# 次の状態」だけを計算する純関数の集合。AR には依存しない。
#
# Que のクイズは多肢選択のため評価は二値で扱う:
#   不正解 → Again(1) / 正解 → Good(3)
#
# 参照: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
module Fsrs
  module_function

  DECAY  = -0.5
  FACTOR = 19.0 / 81.0 # = 0.9 ** (1.0 / DECAY) - 1

  # FSRS-5 既定パラメータ（19 個）
  W = [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046,
    1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315,
    2.9898, 0.51655, 0.6621
  ].freeze

  REQUEST_RETENTION = 0.9
  MIN_INTERVAL      = 1
  MAX_INTERVAL      = 365 * 4

  RATING_AGAIN = 1
  RATING_GOOD  = 3
  RATING_EASY  = 4

  # 現在の復習状態と正誤から、次の {stability, difficulty, due_at} を返す。
  def next_state(stability:, difficulty:, reps:, last_reviewed_at:, correct:, now: Time.current)
    rating = correct ? RATING_GOOD : RATING_AGAIN

    if reps.to_i.zero? || last_reviewed_at.nil?
      stability  = initial_stability(rating)
      difficulty = initial_difficulty(rating)
    else
      elapsed_days = [ (now - last_reviewed_at) / 1.day, 0.0 ].max
      retr         = retrievability(elapsed_days, stability)
      difficulty   = next_difficulty(difficulty, rating)
      stability    = if correct
        next_recall_stability(difficulty, stability, retr, rating)
      else
        next_forget_stability(difficulty, stability, retr)
      end
    end

    stability = stability.clamp(0.01, 36_500.0)
    {
      stability:  stability,
      difficulty: difficulty,
      due_at:     now + interval_days(stability).days
    }
  end

  # ── 内部計算 ─────────────────────────────────────────────────

  # 経過日数 t における記憶の想起率 R(t, S)。
  def retrievability(elapsed_days, stability)
    return 1.0 if stability <= 0
    (1 + FACTOR * elapsed_days / stability)**DECAY
  end

  # 安定度 S から、目標想起率を満たす次回間隔（日）を求める。
  def interval_days(stability)
    raw = (stability / FACTOR) * (REQUEST_RETENTION**(1.0 / DECAY) - 1)
    raw.round.clamp(MIN_INTERVAL, MAX_INTERVAL)
  end

  # 初回レビューの安定度 S0（評価ごとの初期パラメータ）。
  def initial_stability(rating)
    [ W[rating - 1], 0.01 ].max
  end

  # 初回レビューの難易度 D0。
  def initial_difficulty(rating)
    (W[4] - Math.exp(W[5] * (rating - 1)) + 1).clamp(1.0, 10.0)
  end

  # 次の難易度 — 線形ダンピング + Easy 基準への平均回帰（FSRS-5）。
  def next_difficulty(difficulty, rating)
    delta    = -W[6] * (rating - 3)
    damped   = difficulty + delta * (10 - difficulty) / 9.0
    reverted = W[7] * initial_difficulty(RATING_EASY) + (1 - W[7]) * damped
    reverted.clamp(1.0, 10.0)
  end

  # 正答時の次の安定度（記憶の強化）。
  def next_recall_stability(difficulty, stability, retr, rating)
    hard_penalty = rating == 2 ? W[15] : 1.0
    easy_bonus   = rating == RATING_EASY ? W[16] : 1.0
    stability * (1 +
      Math.exp(W[8]) *
      (11 - difficulty) *
      (stability**-W[9]) *
      (Math.exp(W[10] * (1 - retr)) - 1) *
      hard_penalty *
      easy_bonus)
  end

  # 誤答時の次の安定度（記憶の減衰）。失敗で安定度は上がらない。
  def next_forget_stability(difficulty, stability, retr)
    forgotten = W[11] *
      (difficulty**-W[12]) *
      ((stability + 1)**W[13] - 1) *
      Math.exp(W[14] * (1 - retr))
    [ forgotten, stability ].min
  end
end
