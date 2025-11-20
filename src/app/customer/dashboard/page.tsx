'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { showError } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface Card {
  id: string
  currentPunches: number
  targetPunches: number
  status: string
  createdAt: string
  completedAt: string | null
  event: {
    id: string
    name: string
    description: string
  }
  establishment: {
    id: string
    name: string
  }
}

interface Reward {
  id: string
  code: string
  redeemed: boolean
  createdAt: string
  redeemedAt: string | null
  event: {
    id: string
    name: string
  }
  establishment: {
    id: string
    name: string
  }
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClientSupabase()

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/tap')
        return
      }

      setUser(user)

      try {
        // Fetch cards
        const cardsRes = await fetch('/api/customer/cards')
        const cardsData = await cardsRes.json()

        if (cardsData.status === 'success') {
          setCards(cardsData.cards)
        }

        // Fetch rewards
        const rewardsRes = await fetch('/api/customer/rewards')
        const rewardsData = await rewardsRes.json()

        if (rewardsData.status === 'success') {
          setRewards(rewardsData.rewards)
        }
      } catch {
        showError('Failed to load your data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const activeCards = cards.filter(c => c.status === 'active')
  const completedCards = cards.filter(c => c.status === 'completed')
  const availableRewards = rewards.filter(r => !r.redeemed)
  const redeemedRewards = rewards.filter(r => r.redeemed)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Cards</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* Available Rewards - Most Important */}
        {availableRewards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎁</span>
              Available Rewards
            </h2>
            <div className="space-y-3">
              {availableRewards.map(reward => (
                <div
                  key={reward.id}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{reward.establishment.name}</h3>
                      <p className="text-green-100 text-sm">{reward.event.name}</p>
                    </div>
                    <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                      READY
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-xs text-green-100 mb-1">Reward Code</div>
                    <div className="text-3xl font-mono font-bold tracking-wider">{reward.code}</div>
                    <div className="text-xs text-green-100 mt-2">Show this code to redeem</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Cards */}
        {activeCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Cards</h2>
            <div className="space-y-4">
              {activeCards.map(card => {
                const progress = (card.currentPunches / card.targetPunches) * 100
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl p-5 shadow-md border border-gray-100"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {card.establishment.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{card.event.name}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">
                          {card.currentPunches} / {card.targetPunches}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Punches remaining */}
                    <div className="text-sm text-gray-500 mt-2">
                      {card.targetPunches - card.currentPunches} {card.targetPunches - card.currentPunches === 1 ? 'punch' : 'punches'} until reward
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeCards.length === 0 && availableRewards.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No active cards yet
            </h2>
            <p className="text-gray-600">
              Tap an NFC tag at a participating business to start collecting punches!
            </p>
          </div>
        )}

        {/* Completed Cards - Minimal */}
        {completedCards.length > 0 && (
          <div className="mb-8">
            <details className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-semibold text-gray-700">
                Completed Cards ({completedCards.length})
              </summary>
              <div className="p-4 pt-0 space-y-2 border-t border-gray-100">
                {completedCards.map(card => (
                  <div
                    key={card.id}
                    className="flex justify-between items-center py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{card.establishment.name}</div>
                      <div className="text-gray-500 text-xs">{card.event.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(card.completedAt!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Redeemed Rewards - Minimal */}
        {redeemedRewards.length > 0 && (
          <div className="mb-8">
            <details className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-semibold text-gray-700">
                Redeemed Rewards ({redeemedRewards.length})
              </summary>
              <div className="p-4 pt-0 space-y-2 border-t border-gray-100">
                {redeemedRewards.map(reward => (
                  <div
                    key={reward.id}
                    className="flex justify-between items-center py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{reward.establishment.name}</div>
                      <div className="text-gray-500 text-xs">{reward.event.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(reward.redeemedAt!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Just tap NFC tags to collect punches — no app needed!
        </div>
      </div>
    </div>
  )
}
