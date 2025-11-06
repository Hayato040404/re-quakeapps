import React, { useState, useEffect } from 'react';
import LiquidGlassButton from './components/LiquidGlassButton';
import './App.css';

const publicVapidKey = 'BC1T1-o4f9vLJ11ngQXOZTdKY8xd38vUyWeWyPosJ7JDJxnCPrAGtJZE_CUW4dqdh60eEUf5G-qzWjaojsSMer0';

function App() {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [eewData, setEewData] = useState(null);
  const [tsunamiData, setTsunamiData] = useState([]);
  const [adminMessage, setAdminMessage] = useState({ isVisible: false, text: '', type: 'info' });
  const [loading, setLoading] = useState({ earthquake: true, eew: true, tsunami: true });

  useEffect(() => {
    fetchEarthquakeInfo();
    fetchEewInfo();
    fetchTsunamiInfo();
    fetchAdminMessage();
  }, []);

  const fetchAdminMessage = async () => {
    try {
      const response = await fetch('/api/admin-message');
      const data = await response.json();
      if (data.isVisible && data.text) {
        setAdminMessage(data);
      }
    } catch (error) {
      console.error('管理者メッセージの取得に失敗しました:', error);
    }
  };

  const fetchEarthquakeInfo = async () => {
    try {
      const response = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=10');
      const data = await response.json();
      setEarthquakeData(data);
    } catch (error) {
      console.error('Error fetching earthquake information:', error);
    } finally {
      setLoading(prev => ({ ...prev, earthquake: false }));
    }
  };

  const fetchEewInfo = async () => {
    try {
      const response = await fetch('https://api.wolfx.jp/jma_eew.json');
      const data = await response.json();
      setEewData(data);
    } catch (error) {
      console.error('Error fetching EEW information:', error);
    } finally {
      setLoading(prev => ({ ...prev, eew: false }));
    }
  };

  const fetchTsunamiInfo = async () => {
    try {
      const response = await fetch('https://www.jma.go.jp/bosai/tsunami/data/list.json');
      const tsunamiList = await response.json();
      const tsunamiDataArray = [];

      for (const tsunami of tsunamiList.slice(0, 10)) {
        try {
          const detailResponse = await fetch(`https://www.jma.go.jp/bosai/tsunami/data/${tsunami.json}`);
          const detailData = await detailResponse.json();
          tsunamiDataArray.push({ summary: tsunami, details: detailData });
        } catch (detailError) {
          console.error(`Error fetching tsunami details for ${tsunami.json}:`, detailError);
          tsunamiDataArray.push({ summary: tsunami, details: null });
        }
      }
      setTsunamiData(tsunamiDataArray);
    } catch (error) {
      console.error('Error fetching tsunami information:', error);
    } finally {
      setLoading(prev => ({ ...prev, tsunami: false }));
    }
  };

  const subscribe = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        alert('通知が許可されました！');
      } catch (error) {
        console.error('通知の許可に失敗しました:', error);
        alert('通知の許可に失敗しました。');
      }
    } else {
      alert('このブラウザはプッシュ通知をサポートしていません。');
    }
  };

  const sendTestNotification = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const options = {
            body: 'これはテスト通知です。',
            icon: '/icon.png'
          };
          registration.showNotification('テスト通知', options);
        } else {
          alert('サービスワーカーが登録されていません。');
        }
      } catch (error) {
        console.error('テスト通知の送信に失敗しました:', error);
        alert('テスト通知の送信に失敗しました。');
      }
    } else {
      alert('このブラウザはプッシュ通知をサポートしていません。');
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const scrollToEewSection = () => {
    document.getElementById('eewSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTsunamiSection = () => {
    document.getElementById('tsunamiSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="container">
      {adminMessage.isVisible && (
        <div className={`admin-message ${adminMessage.type} show`}>
          <button className="admin-message-close" onClick={() => setAdminMessage({ ...adminMessage, isVisible: false })}>×</button>
          <div>{adminMessage.text}</div>
        </div>
      )}

      <div className="header">
        <h1 className="app-title">地震情報</h1>
        <p className="app-subtitle">Version 6a.3.1</p>
        <div className="button-row">
          <LiquidGlassButton onClick={subscribe}>通知を許可</LiquidGlassButton>
          <LiquidGlassButton onClick={sendTestNotification}>テスト通知</LiquidGlassButton>
          <LiquidGlassButton variant="secondary" onClick={scrollToEewSection}>緊急地震速報へ</LiquidGlassButton>
          <LiquidGlassButton variant="secondary" onClick={scrollToTsunamiSection}>津波情報へ</LiquidGlassButton>
          <LiquidGlassButton variant="secondary" onClick={reloadPage}>再読み込み</LiquidGlassButton>
        </div>
      </div>

      <div className="section-header">地震情報アプリ　Seismo</div>
      <div className="section-subheader">最新の地震情報を表示しています</div>
      <div className="list-group" id="earthquakeList">
        {loading.earthquake ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <div>地震情報を取得中...</div>
          </div>
        ) : earthquakeData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div>現在、表示する地震情報はありません</div>
          </div>
        ) : (
          earthquakeData.map((earthquake, index) => (
            <EarthquakeItem key={index} earthquake={earthquake} index={index} />
          ))
        )}
      </div>

      <div className="section-header" id="eewSection">緊急地震速報</div>
      <div className="section-subheader">緊急地震速報の最新情報</div>
      <div className="list-group" id="eewList">
        {loading.eew ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <div>緊急地震速報を取得中...</div>
          </div>
        ) : !eewData?.Title ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div>現在、緊急地震速報は発表されていません</div>
          </div>
        ) : (
          <EewItem eewData={eewData} />
        )}
      </div>

      <div className="section-header" id="tsunamiSection">津波情報</div>
      <div className="section-subheader">最新の津波予報や警報情報</div>
      <div className="list-group" id="tsunamiList">
        {loading.tsunami ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <div>津波情報を取得中...</div>
          </div>
        ) : tsunamiData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌊</div>
            <div>現在、表示する津波情報はありません</div>
          </div>
        ) : (
          tsunamiData.map((tsunami, index) => (
            <TsunamiItem key={index} tsunami={tsunami} index={index} />
          ))
        )}
      </div>

      <div className="footer">
        <a href="/teams.html">利用規約</a>
      </div>

      <a href="/admin" className="admin-button" title="管理者メニュー">⚙️</a>
    </div>
  );
}

const EarthquakeItem = ({ earthquake, index }) => {
  const time = new Date(earthquake.earthquake.time);
  const date = time.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  const timeStr = time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  const hypocenter = earthquake.earthquake.hypocenter.name;
  const maxScale = getScaleDescription(earthquake.earthquake.maxScale);
  let magnitude = earthquake.earthquake.hypocenter.magnitude;
  magnitude = magnitude === -1 ? '不明' : magnitude.toFixed(1);

  const tsunamiBadge = getTsunamiBadge(earthquake.earthquake.domesticTsunami);

  return (
    <div className="list-item">
      <div className="list-item-content">
        <div className="list-item-header">
          <div className="list-item-title">
            <span className={`scale-indicator scale-${maxScale}`}>震{maxScale}</span>
            {date} {timeStr}
          </div>
        </div>
        <div className="list-item-subtitle">{hypocenter} M{magnitude}</div>
        <div className="list-item-details" dangerouslySetInnerHTML={{ __html: tsunamiBadge }}></div>
      </div>
    </div>
  );
};

const EewItem = ({ eewData }) => {
  const time = eewData.OriginTime ? eewData.OriginTime.split(' ')[1] : '';
  const isCancel = eewData.isCancel;
  const maxIntensity = eewData.MaxIntensity || '';
  const hypocenter = eewData.Hypocenter || '';

  let badgeClass = 'warning';
  let badgeText = '緊急地震速報';

  if (isCancel) {
    badgeClass = 'info';
    badgeText = '取消';
  }

  return (
    <div className="list-item">
      <div className="list-item-content">
        <div className="list-item-header">
          <div className="list-item-title">
            <span className={`badge ${badgeClass}`}>{badgeText}</span>
            {isCancel ? '先程の緊急地震速報は取り消されました' : `最大震度${maxIntensity}程度`}
          </div>
        </div>
        {!isCancel && (
          <>
            <div className="list-item-subtitle">{hypocenter} {time}</div>
            <div className="list-item-details">
              第{eewData.Serial}報 - {eewData.isAssumption ? '精度が低い可能性があります' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TsunamiItem = ({ tsunami, index }) => {
  const summary = tsunami.summary;
  const time = new Date(summary.at);
  const date = time.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
  const timeStr = time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  const hypocenter = summary.anm || '不明';
  const magnitude = summary.mag ? `M${summary.mag}` : '不明';
  let badgeClass = 'forecast';
  let badgeText = '津波予報';

  const items = tsunami.details?.Body?.Tsunami?.Forecast?.Item;
  if (items) {
    const categories = Array.isArray(items)
      ? items.map(item => typeof item.Category?.Kind === 'string' ? item.Category.Kind : '不明')
      : [typeof items.Category?.Kind === 'string' ? items.Category.Kind : '不明'];

    if (categories.some(kind => kind.includes('大津波'))) {
      badgeClass = 'major';
      badgeText = '大津波警報';
    } else if (categories.some(kind => kind.includes('警報'))) {
      badgeClass = 'warning';
      badgeText = '津波警報';
    } else if (categories.some(kind => kind.includes('注意報'))) {
      badgeClass = 'watch';
      badgeText = '津波注意報';
    }
  }

  return (
    <div className="list-item">
      <div className="list-item-content">
        <div className="list-item-header">
          <div className="list-item-title">
            <span className={`badge ${badgeClass}`}>{badgeText}</span>
            {date} {timeStr}
          </div>
        </div>
        <div className="list-item-subtitle">{hypocenter} {magnitude}</div>
        <div className="list-item-details">
          {summary.ift} - 津波情報
        </div>
      </div>
    </div>
  );
};

function getScaleDescription(scale) {
  const scaleDescriptions = {
    10: '1',
    20: '2',
    30: '3',
    40: '4',
    45: '5弱',
    46: '5弱以上と推定されるが震度情報を入手していない',
    50: '5強',
    55: '6弱',
    60: '6強',
    70: '7'
  };
  return scaleDescriptions[scale] || '不明';
}

function getTsunamiBadge(domesticTsunami) {
  const tsunamiBadges = {
    "None": '<span class="badge info">津波の心配なし</span>',
    "Unknown": '<span class="badge">不明</span>',
    "Checking": '<span class="badge">津波調査中</span>',
    "NonEffective": '<span class="badge">若干の海面変動</span>',
    "Watch": '<span class="badge watch">津波注意報</span>',
    "Warning": '<span class="badge warning">津波警報</span>'
  };
  return tsunamiBadges[domesticTsunami] || "";
}

export default App;
