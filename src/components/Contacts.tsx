import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, MessageCircle, Phone, Send } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { contacts, icons, programs } from '../data'
import { onBookingRequest } from '../lib/booking'
import { ClayButton } from './ui/ClayButton'
import { Burst } from './ui/Burst'
import { Reveal } from './ui/Reveal'
import { SplitTitle } from './ui/SplitTitle'
import './Contacts.css'

const cards = [
  { icon: icons.phone, label: 'Телефон', value: contacts.phone, href: contacts.phoneHref, color: 'lime' },
  { icon: icons.speech, label: 'WhatsApp', value: contacts.whatsapp, href: contacts.whatsappHref, color: 'mint' },
  { icon: icons.mobile, label: 'ВКонтакте', value: 'vk.com/chameleon_ufa1', href: contacts.vk, color: 'sky' },
  { icon: icons.pin, label: 'Адрес', value: contacts.address, href: 'https://yandex.ru/maps/?text=Уфа, Российская, 7', color: 'peach' },
]

export function Contacts() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', program: '', comment: '' })
  const [sent, setSent] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(
    () =>
      onBookingRequest(({ program, duration }) => {
        setForm((f) => ({ ...f, program: duration ? `${program} — ${duration}` : program }))
        setFlash(true)
        setTimeout(() => setFlash(false), 1600)
      }),
    [],
  )

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const lines = [
      'Здравствуйте! Хочу заказать праздник 🎉',
      `Имя: ${form.name}`,
      `Телефон: ${form.phone}`,
      form.date && `Дата: ${new Date(form.date).toLocaleDateString('ru-RU')}`,
      form.program && `Программа: ${form.program}`,
      form.comment && `Пожелания: ${form.comment}`,
    ].filter(Boolean)
    window.open(`${contacts.whatsappHref}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
    setSent(true)
  }

  const programOptions = programs.flatMap((p) => [p.name, ...p.prices.map((pr) => `${p.name} — ${pr.label}`)])

  return (
    <section id="contacts" className="section contacts">
      <div className="blob" style={{ width: 520, height: 520, background: 'var(--c-lime)', bottom: -100, left: -180 }} />
      <div className="container">
        <div className="contacts__head">
          <Reveal>
            <span className="eyebrow clay clay--peach">
              <img src={icons.rocket} alt="" /> Контакты
            </span>
          </Reveal>
          <SplitTitle className="section-title" text="Оставляй заявку — устроим праздник мечты!" />
        </div>

        <div className="contacts__grid">
          <div className="contacts__side">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08} y={30}>
                <motion.a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`contacts__card clay clay--${c.color}`}
                  whileHover={{ x: 10, rotate: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <motion.img src={c.icon} alt="" whileHover={{ rotate: [0, -15, 15, 0] }} />
                  <span>
                    <small>{c.label}</small>
                    <strong>{c.value}</strong>
                  </span>
                </motion.a>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="contacts__map clay">
                <iframe src={contacts.mapSrc} title="Карта: Уфа, Российская, 7" loading="lazy" allowFullScreen />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <motion.div className="contacts__form-wrap clay" animate={flash ? { scale: [1, 1.03, 1], rotate: [0, -1, 1, 0] } : {}} transition={{ duration: 0.6 }}>
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form key="form" className="contacts__form" onSubmit={submit} exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}>
                    <h3>Заявка на праздник</h3>
                    <p className="contacts__form-sub">Заполните форму — мы свяжемся с вами и подберём программу.</p>
                    <label className="field">
                      <span>Ваше имя</span>
                      <input className="clay-inset" required value={form.name} onChange={set('name')} placeholder="Например, Анна" autoComplete="name" />
                    </label>
                    <label className="field">
                      <span>Телефон</span>
                      <input className="clay-inset" required type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" autoComplete="tel" />
                    </label>
                    <div className="field-row">
                      <label className="field">
                        <span>Дата праздника</span>
                        <input className="clay-inset" type="date" value={form.date} onChange={set('date')} />
                      </label>
                      <label className={`field ${flash ? 'field--flash' : ''}`}>
                        <span>Программа</span>
                        <select className="clay-inset" value={form.program} onChange={set('program')}>
                          <option value="">Подобрать</option>
                          {programOptions.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="field">
                      <span>Пожелания</span>
                      <textarea className="clay-inset" rows={3} value={form.comment} onChange={set('comment')} placeholder="Возраст именинника, количество детей, любимые герои…" />
                    </label>
                    <ClayButton type="submit" className="contacts__submit" magnetic={false}>
                      <Send size={18} /> Отправить в WhatsApp
                    </ClayButton>
                    <a className="contacts__alt" href={contacts.yandexForm} target="_blank" rel="noopener noreferrer">
                      или заполнить анкету на Яндекс.Формах <ExternalLink size={14} />
                    </a>
                    <p className="contacts__legal">
                      Нажимая на кнопку, вы соглашаетесь с{' '}
                      <a href={contacts.policy}>
                        Политикой конфиденциальности
                      </a>{' '}
                      и даёте{' '}
                      <a href={contacts.consent}>
                        согласие на обработку персональных данных
                      </a>
                      .
                    </p>
                  </motion.form>
                ) : (
                  <motion.div key="ok" className="contacts__ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
                    <Burst />
                    <motion.img src={icons.party} alt="" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                    <h3>Ура! Почти готово</h3>
                    <p>Мы открыли WhatsApp с вашей заявкой — осталось нажать «Отправить». Если окно не открылось, позвоните нам.</p>
                    <div className="contacts__ok-actions">
                      <ClayButton href={contacts.phoneHref} variant="lime">
                        <Phone size={18} /> {contacts.phone}
                      </ClayButton>
                      <ClayButton variant="white" onClick={() => setSent(false)}>
                        <MessageCircle size={18} /> Новая заявка
                      </ClayButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
