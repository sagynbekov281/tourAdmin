const LEVELS = [['easy','Лёгкий'],['medium','Средний'],['hard','Сложный']];
const ICONS = [['mountain','Горы'],['water','Вода/озеро'],['tent','Юрта/кемпинг'],['rideshare','Внедорожник'],['snow','Зима/лыжи'],['plant','Природа/заповедник']];
// типы: text, textarea, number, date, select, checkbox, list (через запятую), lines (с новой строки)
export const SCHEMA = {
  courses: { one: 'тур', endpoint: '/api/admin/tours', key: 'tours', seed: 'tours', fields: [
    ['title','Название тура (RU)','text'],['titleEn','Название тура (EN)','text'],
    ['destination','Направление (RU)','text'],['destinationEn','Направление (EN)','text'],
    ['description','Короткое описание (RU)','textarea'],['descriptionEn','Короткое описание (EN)','textarea'],
    ['about','Подробное описание (RU)','textarea'],['aboutEn','Подробное описание (EN)','textarea'],
    ['duration','Длительность, например: 3 дня / 2 ночи','text'],
    ['difficultyKey','Сложность','select',LEVELS],['iconKey','Иконка','select',ICONS],
    ['groupSize','Размер группы (RU)','text'],['groupSizeEn','Размер группы (EN)','text'],
    ['totalSeats','Всего мест (0 — не отслеживать)','number'],['price','Цена за человека (сом)','number'],
    ['discountPercent','Скидка, % (0 — нет)','number'],['discountEndsAt','Скидка до (пусто — без срока)','date'],
    ['itinerary','Программа по дням, с новой строки (RU)','lines'],['itineraryEn','Программа по дням (EN)','lines'],
    ['included','Что входит, через запятую (RU)','list'],['includedEn','Что входит (EN)','list'],
    ['highlights','Теги для карточки (RU)','list'],['highlightsEn','Теги (EN)','list'],
    ['rating','Рейтинг (0–5)','number'],['reviewsCount','Количество отзывов','number'],
    ['order','Порядок (меньше — выше)','number'],['active','Показывать на сайте','checkbox'],
  ]},
  teachers: { one: 'гида', endpoint: '/api/admin/guides', key: 'guides', seed: 'guides', fields: [
    ['name','Имя и фамилия','text'],['role','Должность (RU)','text'],['roleEn','Должность (EN)','text'],
    ['experience','Опыт (RU)','text'],['experienceEn','Опыт (EN)','text'],
    ['languages','Языки, через запятую (RU)','list'],['languagesEn','Языки (EN)','list'],
    ['regions','Направления (RU)','list'],['regionsEn','Направления (EN)','list'],
    ['bio','О себе (RU)','textarea'],['bioEn','О себе (EN)','textarea'],
    ['order','Порядок','number'],['active','Показывать на сайте','checkbox'],
  ]},
};
