
import React, { useState } from 'react';
import { PlayerStats, UpgradeType, ConsumableType } from '../../types';
import { SKINS, BACKGROUNDS, UPGRADES, CONSUMABLES } from '../../constants';
import { ArrowLeft, Magnet, Shield, Target, Clock, Gift, Star } from 'lucide-react';
import { ChocolateIcon } from './GameIcons';

interface ShopProps {
  stats: PlayerStats;
  onBack: () => void;
  onBuySkin: (id: string, price: number) => void;
  onEquipSkin: (id: string) => void;
  onBuyBg: (id: string, price: number) => void;
  onEquipBg: (id: string) => void;
  onBuyUpgrade: (id: UpgradeType) => void;
  onBuyConsumable: (id: ConsumableType) => void;
}

const getUpgradeIcon = (type: UpgradeType) => {
  switch (type) {
    case UpgradeType.MAGNET: return <Magnet />;
    case UpgradeType.GREED: return <ChocolateIcon size={20} />;
    case UpgradeType.IRON_SCALE: return <Shield />;
    case UpgradeType.LUCKY_FIND: return <Target />;
    case UpgradeType.EXTENDED_POWER: return <Clock />;
    default: return <Star />;
  }
};

export const Shop: React.FC<ShopProps> = ({
  stats, onBack, onBuySkin, onEquipSkin, onBuyBg, onEquipBg, onBuyUpgrade, onBuyConsumable
}) => {
  const [activeTab, setActiveTab] = useState<'UPGRADES' | 'ITEMS' | 'SKINS' | 'WORLDS'>('UPGRADES');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-20">
      <div className="w-full max-w-6xl h-full md:h-[90vh] bg-[#1a1a1a] md:rounded-3xl border border-white/10 overflow-hidden flex flex-col animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-black/40 backdrop-blur-md gap-4 shrink-0">
          <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors font-bold self-start md:self-center">
            <ArrowLeft size={20} /> BACK
          </button>

          <div className="flex gap-1 bg-black/40 p-1 rounded-full border border-white/5 overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: 'UPGRADES', label: 'Skills' },
              { id: 'ITEMS', label: 'Items' },
              { id: 'SKINS', label: 'Skins' },
              { id: 'WORLDS', label: 'Worlds' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[#8D6E63] font-bold bg-[#8D6E63]/10 px-4 py-2 rounded-full border border-[#8D6E63]/20 self-end md:self-center">
            <ChocolateIcon size={18} /> {stats.points.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#1a1a1a] to-black">

          {/* UPGRADES */}
          {activeTab === 'UPGRADES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {UPGRADES.map(upgrade => {
                const currentLevel = stats.upgrades[upgrade.id] || 0;
                const isMax = currentLevel >= upgrade.maxLevel;
                const cost = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMult, currentLevel));
                const canAfford = stats.points >= cost;

                return (
                  <div key={upgrade.id} className="relative p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-4 group">
                    <div className="flex justify-between items-start">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-white/5">
                        {getUpgradeIcon(upgrade.id)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Level</div>
                        <div className="text-xl font-black text-white">{currentLevel} / {upgrade.maxLevel}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic">{upgrade.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 h-10">{upgrade.desc}</p>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}></div>
                    </div>
                    <button
                      onClick={() => onBuyUpgrade(upgrade.id)}
                      disabled={isMax || !canAfford}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all 
                        ${isMax ? 'bg-emerald-500/20 text-emerald-500 cursor-default' : canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      {isMax ? 'MAXED OUT' : <>Upgrade <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded text-[#8D6E63]"><ChocolateIcon size={12} /> {cost}</span></>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ITEMS */}
          {activeTab === 'ITEMS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {CONSUMABLES.map(item => {
                const owned = stats.inventory[item.id] || 0;
                const canAfford = stats.points >= item.price;

                return (
                  <div key={item.id} className="relative p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400 border border-white/5">
                        <Gift size={24} />
                      </div>
                      <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                        OWNED: {owned}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 h-10">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => onBuyConsumable(item.id)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all 
                        ${canAfford ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      Buy <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded text-[#8D6E63]"><ChocolateIcon size={12} /> {item.price}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SKINS & WORLDS */}
          {(activeTab === 'SKINS' || activeTab === 'WORLDS') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {(activeTab === 'SKINS' ? SKINS : BACKGROUNDS).map((item) => {
                const isSkin = activeTab === 'SKINS';
                const owned = isSkin ? stats.ownedSkins.includes(item.id) : stats.ownedBackgrounds.includes(item.id);
                const itemClass = isSkin ? (item as any).color : (item as any).class;
                const equipped = isSkin ? stats.currentSkin === itemClass : stats.currentBackground === itemClass;

                return (
                  <div key={item.id} className={`group relative p-6 rounded-3xl border transition-all ${equipped ? 'bg-emerald-900/10 border-emerald-500' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-black/40 p-4 rounded-2xl shadow-inner">
                        {isSkin ? (
                          <div className={`w-16 h-16 rounded-lg ${itemClass} shadow-lg relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                          </div>
                        ) : (
                          <div className={`w-20 h-16 rounded-lg border border-white/20 ${itemClass} bg-cover bg-center`}></div>
                        )}
                      </div>
                      {equipped && <div className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.5)]">Active</div>}
                    </div>
                    <h3 className="text-xl font-black text-white italic tracking-tight mb-1">{item.name}</h3>
                    {!owned && <p className="text-[#8D6E63] font-bold text-sm mb-6 flex items-center gap-1"><ChocolateIcon size={14} /> {item.price}</p>}
                    {owned && <p className="text-gray-500 text-xs mb-6 font-bold uppercase tracking-wider">Purchased</p>}
                    {owned ? (
                      <button
                        onClick={() => isSkin ? onEquipSkin(itemClass) : onEquipBg(itemClass)}
                        disabled={equipped}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${equipped ? 'bg-white/5 text-gray-500 cursor-default' : 'bg-white text-black hover:scale-105 shadow-lg'}`}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => isSkin ? onBuySkin(item.id, item.price) : onBuyBg(item.id, item.price)}
                        disabled={stats.points < item.price}
                        className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
