const axios = require('axios');
const cheerio = require('cheerio');

const MONITOR_URL = process.env.MONITOR_URL || 'https://www.sscctpe.org.tw/';

/**
 * 爬取松山社大最新公告
 * 回傳 [{ date, title, category, url }]
 */
async function fetchAnnouncements() {
  try {
    const { data: html } = await axios.get(MONITOR_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const announcements = [];

    // ── 策略 1：公告列表區塊 ──
    $('.news_list li, #news_list li, li.news-item').each(function () {
      const $item = $(this);

      let date = '';
      const $dateEl = $item.find('.date, span.date, .new_date');
      if ($dateEl.length) {
        date = $dateEl.text().trim();
      } else {
        const text = $item.text().trim();
        const match = text.match(/(\d{1,2})-(\d{1,2})/);
        if (match) date = `${match[1]}-${match[2]}`;
      }

      let title = '';
      let link = '';
      const $titleEl = $item.find('.title, a.title, .news_title, h3 a, h4 a');
      if ($titleEl.length) {
        title = $titleEl.text().trim();
        link = $titleEl.attr('href') || '';
      } else {
        const $link = $item.find('a').first();
        if ($link.length) {
          title = $link.text().trim();
          link = $link.attr('href') || '';
        }
      }

      let category = '';
      const $catEl = $item.find('.category, span.category, .news_category');
      if ($catEl.length) {
        category = $catEl.text().trim();
      }

      if (title && date) {
        if (link && !link.startsWith('http')) {
          link = new URL(link, MONITOR_URL).href;
        } else if (!link) {
          link = MONITOR_URL;
        }
        announcements.push({ date, title, category, url: link });
      }
    });

    // ── 策略 2：表格形式 ──
    if (announcements.length === 0) {
      $('table tr').each(function () {
        const $row = $(this);
        const cells = $row.find('td, th');

        if (cells.length >= 2) {
          const date = $(cells[0]).text().trim();
          const $link = $(cells[1]).find('a').first();
          const title = $link ? $link.text().trim() : $(cells[1]).text().trim();
          const link = $link && $link.attr('href') ? $link.attr('href') : '';

          if (title && date) {
            let fullLink = link;
            if (fullLink && !fullLink.startsWith('http')) {
              fullLink = new URL(fullLink, MONITOR_URL).href;
            } else if (!fullLink) {
              fullLink = MONITOR_URL;
            }
            announcements.push({ date, title, category: '', url: fullLink });
          }
        }
      });
    }

    // ── 策略 3：最原始的方法——抓所有 <a> 標籤，過濾日期和標題 ──
    if (announcements.length === 0) {
      const items = [];
      $('a').each(function () {
        const text = $(this).text().trim();
        const href = $(this).attr('href') || '';
        if (text.length > 5 && text.length < 100) {
          items.push({ text, href });
        }
      });

      // 找前面有日期模式的連結
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (i > 0) {
          const prev = items[i - 1];
          const dateMatch = prev.text.match(/^(\d{1,2})-(\d{1,2})$/);
          if (dateMatch && item.href !== prev.href) {
            let url = item.href;
            if (url && !url.startsWith('http')) {
              url = new URL(url, MONITOR_URL).href;
            } else if (!url) {
              url = MONITOR_URL;
            }
            announcements.push({
              date: `${dateMatch[1]}-${dateMatch[2]}`,
              title: item.text,
              category: '',
              url
            });
          }
        }
      }
    }

    // 過濾掉頁尾「友好連結」區塊的誤抓（標題太短或不含常見公告關鍵字）
    const filtered = announcements.filter(a => {
      // 排除標題太短的
      if (a.title.length < 8) return false;
      // 排除明顯是連結名稱而非公告的
      const skipTitles = ['臺北市立', '松山社大', '看守台灣協會', '教室智慧空間'];
      if (skipTitles.some(t => a.title.includes(t) && a.title.length < 15)) return false;
      return true;
    });

    console.log(`✅ 抓到 ${filtered.length} 則公告（原始 ${announcements.length} 筆，過濾 ${announcements.length - filtered.length} 筆）`);
    return filtered;

  } catch (err) {
    console.error('❌ 爬取失敗：', err.message);
    return [];
  }
}

module.exports = { fetchAnnouncements };
