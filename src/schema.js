const LEVELS = [['easy', 'Лёгкий'], ['medium', 'Средний'], ['hard', 'Сложный']];

// В форме оставлены только данные, которые показываются посетителю или нужны
// для бронирования. Поля с суффиксом En открываются на отдельной вкладке.
export const SCHEMA = {
  courses: {
    one: 'тур', endpoint: '/api/admin/tours', key: 'tours', seed: 'tours', fields: [
      ['title', 'Название тура', 'text'], ['titleEn', 'Название тура', 'text'],
      ['photo', 'Фото тура (JPG, PNG или WebP, исходник до 5 МБ)', 'image'],
      ['destination', 'Направление', 'text'], ['destinationEn', 'Направление', 'text'],
      ['description', 'Краткое описание', 'textarea'], ['descriptionEn', 'Краткое описание', 'textarea'],
      ['about', 'Информация о туре', 'textarea'], ['aboutEn', 'Информация о туре', 'textarea'],
      ['duration', 'Длительность, например: 3 дня / 2 ночи', 'text'],
      ['difficultyKey', 'Сложность', 'select', LEVELS],
      ['groupSize', 'Размер группы', 'text'], ['groupSizeEn', 'Размер группы', 'text'],
      ['totalSeats', 'Количество мест (0 — не ограничено)', 'number'],
      ['price', 'Цена за человека (сом)', 'number'],
      ['discountPercent', 'Скидка, %', 'number'],
      ['discountEndsAt', 'Скидка действует до', 'date'],
      ['itinerary', 'Программа по дням — каждый пункт с новой строки', 'lines'], ['itineraryEn', 'Программа по дням', 'lines'],
      ['included', 'Что входит — через запятую', 'list'], ['includedEn', 'Что входит', 'list'],
      ['highlights', 'Короткие теги для карточки — через запятую', 'list'], ['highlightsEn', 'Короткие теги для карточки', 'list'],
      ['active', 'Показывать на сайте', 'checkbox'],
    ],
  },
  teachers: {
    one: 'сотрудника', endpoint: '/api/admin/guides', key: 'guides', seed: 'guides', fields: [
      ['name', 'Имя и фамилия', 'text'], ['photo', 'Фотография (JPG, PNG или WebP, исходник до 5 МБ)', 'image'],
      ['role', 'Роль', 'text'], ['roleEn', 'Роль', 'text'],
      ['experience', 'Опыт', 'text'], ['experienceEn', 'Опыт', 'text'],
      ['languages', 'Языки — через запятую', 'list'], ['languagesEn', 'Языки', 'list'],
      ['regions', 'Направления — через запятую', 'list'], ['regionsEn', 'Направления', 'list'],
      ['bio', 'Краткая информация', 'textarea'], ['bioEn', 'Краткая информация', 'textarea'],
      ['about', 'Полная информация', 'textarea'], ['aboutEn', 'Полная информация', 'textarea'],
      ['active', 'Показывать на сайте', 'checkbox'],
    ],
  },
};
