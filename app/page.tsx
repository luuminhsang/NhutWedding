"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronDown, Copy, ExternalLink, Heart, MapPin, Music2, Pause, Send, Share2, Sparkles, X } from "lucide-react";
import "./location.css";
import "./mobile.css";
import "./credit.css";
import "./animations.css";
import "./gallery-motion.css";
import "./wedding-photos.css";
import { useSubmission } from "@/lib/submissions/use-submission";

const events = [
  { title: "Lễ gia tiên", detail: "10:00, Thứ Bảy 28/11/2026 (nhằm 20/10/2026 âm lịch) · Tư gia nhà trai", icon: "✦" },
  { title: "Đãi tiệc mừng", detail: "Thứ Bảy 27–28/11/2026 (nhằm 19–20/10/2026 âm lịch) · Tư gia · Giờ sẽ được cập nhật", icon: "♡" },
];

const weddingPhotos = [
  { src: "/images/wedding/burgundy.png", alt: "Nhứt và Ngân nắm tay bên hoa đỏ, cô dâu giơ cao bó hoa", position: "50% 40%" },
  { src: "/images/wedding/hands-and-tulips.png", alt: "Đôi bàn tay đeo nhẫn cưới bên bó hoa tulip hồng trắng", position: "50% 42%" },
  { src: "/images/wedding/castle.png", alt: "Nhứt và Ngân bên lâu đài với khăn voan bay trong gió", position: "50% 55%" },
  { src: "/images/wedding/neoclassical.png", alt: "Nhứt nắm tay Ngân giữa những hàng cột trắng", position: "50% 42%" },
  { src: "/images/wedding/newlywed-studio.png", alt: "Nhứt và Ngân trao ánh nhìn trong trang phục cưới trắng", position: "50% 35%" },
  { src: "/images/wedding/bridal-portrait.png", alt: "Ngân cầm hoa tulip, dịu dàng đứng trước Nhứt", position: "50% 30%" },
];
const weddingDate = new Date("2026-11-28T10:00:00+07:00");

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px", amount: "some" });
  return <section ref={ref} id={id} className={`section${inView ? " is-visible" : ""}`}><div className="section-heading"><p>{eyebrow}</p><h2>{title}</h2><span /></div>{children}</section>;
}

function Petals() {
  return <div className="petal-field" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <span key={index} className="petal-track" style={{
    left: `${(index * 37 + 9) % 100}%`,
    "--fall-duration": `${12 + index % 7}s`,
    "--fall-delay": `${-index * 2.7}s`,
    "--petal-size": `${8 + index % 5 * 2}px`,
    "--drift": `${index % 2 ? 65 : -65}px`,
  } as CSSProperties}><i className={index % 3 === 0 ? "gold-petal" : ""} /></span>)}</div>;
}

function AnimatedGallery({ onSelect, paused }: { onSelect: (index: number) => void; paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: .08 });
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return <div ref={ref} className="gallery motion-gallery" data-running={inView && pageVisible && !paused}>
    {weddingPhotos.map((photo, index) => <button
      key={photo.src}
      type="button"
      className={`gallery-item item-${index + 1}`}
      style={{ "--frame-index": index, "--frame-tilt": `${index % 2 ? 1 : -1}deg` } as CSSProperties}
      onClick={() => onSelect(index)}
      aria-label={`Xem ảnh ${index + 1}: ${photo.alt}`}
    >
      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 680px) 50vw, (max-width: 1200px) 60vw, 700px" style={{ objectFit: "cover", objectPosition: photo.position }} />
      <div className="gallery-dust" aria-hidden="true"><Heart /><Sparkles /><Heart /></div>
      <div className="gallery-gleam" aria-hidden="true" />
      <div className="gallery-view" aria-hidden="true"><ExternalLink size={16} /></div>
      <span>Khoảnh khắc {String(index + 1).padStart(2, "0")}</span><i>Xem ảnh</i>
    </button>)}
  </div>;
}

export default function WeddingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const rsvpSubmission = useSubmission("/api/rsvp");
  const [now, setNow] = useState<number | null>(null);
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || !effectsEnabled;
  const audioRef = useRef<HTMLAudioElement>(null);
  const canonicalUrl = typeof window === "undefined" ? "" : window.location.origin;

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isOpening) return;
    const timer = window.setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, reducedMotion ? 0 : 1300);
    return () => window.clearTimeout(timer);
  }, [isOpening, reducedMotion]);

  useEffect(() => {
    if (isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const displayTime = useMemo(() => {
    if (now === null) return ["Ngày", "Giờ", "Phút", "Giây"].map((label) => ({ label, value: "--" }));
    const remaining = Math.max(0, weddingDate.getTime() - now);
    const totalSeconds = Math.floor(remaining / 1000);
    return [
      { label: "Ngày", value: String(Math.floor(totalSeconds / 86_400)).padStart(2, "0") },
      { label: "Giờ", value: String(Math.floor(totalSeconds / 3_600) % 24).padStart(2, "0") },
      { label: "Phút", value: String(Math.floor(totalSeconds / 60) % 60).padStart(2, "0") },
      { label: "Giây", value: String(totalSeconds % 60).padStart(2, "0") },
    ];
  }, [now]);
  const openInvitation = () => { if (!isOpening) setIsOpening(true); };
  const toggleMusic = async () => { const audio = audioRef.current; if (!audio) return; if (musicOn) audio.pause(); else await audio.play().catch(() => undefined); setMusicOn(!musicOn); };
  const share = async () => { if (navigator.share) await navigator.share({ title: "Nhứt & Ngân | Our Wedding", url: canonicalUrl }); else await navigator.clipboard.writeText(canonicalUrl); };
  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (await rsvpSubmission.submit(event.currentTarget)) setSent(true); };

  return <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}><main className={`wedding-page${isOpen ? " invitation-open" : ""}`} data-effects={reducedMotion ? "off" : "on"}>
    <audio ref={audioRef} loop preload="none" src="/music/wedding.mp3" />
    <AnimatePresence>{!isOpen && <motion.div className={`intro${isOpening ? " is-opening" : ""}`} initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : .55 } }}>
      <Petals />
      <div className="intro-stars">✦ &nbsp; ♡ &nbsp; ✦</div><p className="kicker">A love story, warmly shared</p>
      <div className="envelope" aria-label="Phong bì thiệp cưới Nhứt và Ngân"><div className="envelope-flap" /><div className="card"><p>Trân trọng kính mời</p><strong>Nhứt <i>&amp;</i> Ngân</strong><small>OUR WEDDING</small></div><button className="seal" onClick={openInvitation} aria-label="Mở thiệp cưới">N<br />N</button></div>
      <button className="open-button" onClick={openInvitation} disabled={isOpening}>Mở thiệp <Heart size={15} fill="currentColor" /></button><button className="skip-button" onClick={() => { setIsOpening(false); setIsOpen(true); window.scrollTo({ top: 0, behavior: "instant" }); }}>Bỏ qua phần mở đầu</button>
    </motion.div>}</AnimatePresence>

    <div inert={!isOpen}>
    <nav className="nav" aria-label="Điều hướng chính"><a href="#welcome" className="brand">N <span>&amp;</span> M</a><div><a href="#story">Câu chuyện</a><a href="#events">Sự kiện</a><a href="#rsvp">Xác nhận</a></div><button onClick={share} aria-label="Chia sẻ thiệp"><Share2 size={18} /></button></nav>
    <header id="welcome" className="hero">
      {isOpen && <Petals />}
      <div className="hero-glow" />
      <div className="hero-sparkles" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index} style={{ left: `${12 + (index * 13) % 78}%`, top: `${18 + (index * 19) % 66}%`, animationDelay: `${index * -.7}s` }}>✦</span>)}</div>
      <div className="hero-content">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 12 }} transition={{ duration: reducedMotion ? 0 : .7, delay: reducedMotion ? 0 : .3 }} className="kicker">THE WEDDING OF</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 24 }} transition={{ duration: reducedMotion ? 0 : .9, delay: reducedMotion ? 0 : .5 }}>Nhứt <span>&amp;</span> <span className="bride-display">Ngân</span></motion.h1>
        <p className="hero-copy">Một chương mới được viết nên bằng tình yêu, niềm vui và sự hiện diện quý giá của bạn.</p>
        <a className="outline-button" href="#rsvp">Xác nhận tham dự <ChevronDown size={17} /></a>
      </div>
      <div className="hero-note">LỄ GIA TIÊN<br /><b>10:00 · THỨ BẢY, 28.11.2026</b></div>
      <a href="#story" className="scroll-cue" aria-label="Khám phá câu chuyện của chúng mình"><span /><ChevronDown size={16} /></a>
    </header>

    <Section id="story" eyebrow="OUR STORY" title="Một lời hẹn ước"><div className="story-grid"><div className="story-photo"><Image src="/images/wedding/classic-red-velvet.png" alt="Ảnh cưới Nhứt và Ngân bên hoa đỏ và phông nhung đỏ" fill sizes="(max-width: 680px) 100vw, 480px" style={{ objectFit: "cover", objectPosition: "50% 45%" }} /></div><div className="story-copy"><p className="script">With all our hearts</p><p>Chúng mình rất hạnh phúc khi được sẻ chia khoảnh khắc đáng nhớ này cùng gia đình và những người bạn thân yêu.</p><p>Trân trọng kính mời quý khách đến chung vui trong lễ tân hôn của chúng mình.</p><div className="gold-rule" /><dl><div><dt>Chú rể</dt><dd>Bùi Thanh Nhứt</dd></div><div><dt>Cô dâu</dt><dd>Trần Thị Mỹ Ngân</dd></div></dl></div></div></Section>
    <Section id="families" eyebrow="WITH LOVE FROM" title="Gia đình hai bên"><div className="family-grid"><article><Sparkles /><p>GIA ĐÌNH NHÀ TRAI</p><strong>Ông Bùi Thanh Nhanh<br />Bà Nguyễn Thị Hồng Linh</strong><small>Ấp Thạnh Mỹ B, Xã Tân Bình, TP Cần Thơ</small></article><article><Sparkles /><p>GIA ĐÌNH NHÀ GÁI</p><strong>Ông Trần Hải Quân<br />Bà Nguyễn Thanh Tuyền</strong><small>Ấp Phạm Kiểu, Phường Khánh Hòa, TP Cần Thơ</small></article></div></Section>
    <Section id="countdown" eyebrow="COUNTING THE MOMENTS" title="Ngày vui đang đến"><p className="section-lead">Đếm ngược sẽ tự động hoạt động ngay khi quản trị viên chọn sự kiện chính.</p><div className="countdown">{displayTime.map((item) => <div key={item.label}><b className="countdown-value"><span key={item.value} className="countdown-digit">{item.value}</span></b><span>{item.label}</span></div>)}</div><button className="text-button" disabled><CalendarDays size={17} /> Thêm vào lịch (chờ lịch chính thức)</button></Section>
    <Section id="events" eyebrow="SAVE THE DATE" title="Lịch trình ngày cưới"><div className="timeline">{events.map((event, index) => <article key={event.title}><i>{event.icon}</i><div><p>{index === 0 ? "Sự kiện chính" : "Tiệc mừng"}</p><h3>{event.title}</h3><span>{event.detail}</span></div></article>)}</div></Section>
    <Section id="locations" eyebrow="WHERE TO CELEBRATE" title="Địa điểm"><div className="location-card"><MapPin size={28} /><div><p>LỄ GIA TIÊN · TƯ GIA NHÀ TRAI</p><h3>Ấp Thạnh Mỹ B, Xã Tân Bình, TP Cần Thơ</h3><span>Nhấn “Chỉ đường” để mở Google Maps.</span></div><a className="directions-button" href="https://maps.app.goo.gl/Cx51jhy5LQs8XKmx6" target="_blank" rel="noreferrer">Chỉ đường <ExternalLink size={15} /></a></div></Section>
    <Section id="gallery" eyebrow="WEDDING ALBUM" title="Những khoảnh khắc yêu thương"><p className="section-lead">Lưu giữ những khoảnh khắc ngọt ngào của chúng mình.</p><AnimatedGallery onSelect={setLightbox} paused={!!reducedMotion || lightbox !== null || !isOpen} /></Section>
    <Section id="rsvp" eyebrow="RSVP" title="Bạn sẽ đến chung vui chứ?"><div className="rsvp-wrap"><div><p className="script">Your presence is our greatest gift</p><p>Vui lòng để lại phản hồi để gia đình chuẩn bị chu đáo. Sự hiện diện của bạn là niềm vui của chúng mình.</p></div>{sent ? <div className="success" role="status"><Heart size={34} fill="currentColor" /><h3>Cảm ơn bạn!</h3><p>Phản hồi của bạn đã được gửi thành công.</p></div> : <form onSubmit={submitRsvp} aria-busy={rsvpSubmission.submitting}><label>Họ và tên<input name="guest_name" minLength={2} maxLength={100} required /></label><label>Email hoặc số điện thoại (tuỳ chọn)<input name="contact" maxLength={120} /></label><label>Bạn có thể tham dự?<select name="attendance" defaultValue="attending"><option value="attending">Có, tôi sẽ tham dự</option><option value="unsure">Chưa chắc chắn</option><option value="declined">Rất tiếc, tôi không thể tham dự</option></select></label><label>Số người tham dự<input name="guest_count" type="number" min="0" max="10" defaultValue="1" required /></label><label>Lời nhắn (tuỳ chọn)<textarea name="message" maxLength={500} rows={3} /></label><label className="consent"><input type="checkbox" name="consent" required /> Tôi đồng ý để gia đình sử dụng và chia sẻ thông tin này cho việc tổ chức tiệc cưới.</label>{rsvpSubmission.error && <p className="form-error" role="alert">{rsvpSubmission.error}</p>}<button className="primary-button" type="submit" disabled={rsvpSubmission.submitting}>{rsvpSubmission.submitting ? "Đang gửi…" : "Gửi xác nhận"} <Send size={16} /></button></form>}</div></Section>
    <Section id="guestbook" eyebrow="LOVE NOTES" title="Gửi lời chúc"><Guestbook /></Section>
    <footer><p className="script">Nhứt & Ngân</p><span>Thank you for being part of our story</span><div><button onClick={share}><Share2 size={16} /> Chia sẻ thiệp</button><button onClick={() => navigator.clipboard.writeText(canonicalUrl)}><Copy size={16} /> Sao chép liên kết</button></div><p className="design-credit">Design by MINH SANG</p></footer>
    <button className="music" onClick={toggleMusic} aria-label={musicOn ? "Tắt nhạc nền" : "Bật nhạc nền"}>{musicOn ? <Pause size={17} /> : <Music2 size={17} />}</button>
    <AnimatePresence>{lightbox !== null && <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .25 }} role="dialog" aria-modal="true" aria-label="Xem ảnh"><button className="close" onClick={() => setLightbox(null)} aria-label="Đóng"><X /></button><motion.div key={lightbox} className="lightbox-photo" initial={reducedMotion ? false : { opacity: 0, scale: .94, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .35 }}><Image src={weddingPhotos[lightbox].src} alt={weddingPhotos[lightbox].alt} fill sizes="(max-width: 680px) 94vw, 90vw" style={{ objectFit: "contain" }} /></motion.div><button className="lightbox-next" onClick={() => setLightbox((lightbox + 1) % weddingPhotos.length)}>Tiếp theo</button></motion.div>}</AnimatePresence>
    </div>
    <button className="effects-toggle" onClick={() => setEffectsEnabled((enabled) => !enabled)} disabled={!!systemReducedMotion} aria-pressed={!reducedMotion} aria-label={systemReducedMotion ? "Đã giảm chuyển động theo cài đặt thiết bị" : effectsEnabled ? "Tắt hiệu ứng chuyển động" : "Bật hiệu ứng chuyển động"} title={systemReducedMotion ? "Đã giảm chuyển động theo thiết bị" : effectsEnabled ? "Tắt hiệu ứng" : "Bật hiệu ứng"}><Sparkles size={17} /><span>{reducedMotion ? "Hiệu ứng tắt" : "Hiệu ứng bật"}</span></button>
  </main></MotionConfig>;
}

function Guestbook() {
  const [done, setDone] = useState(false);
  const submission = useSubmission("/api/guestbook");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (await submission.submit(event.currentTarget)) setDone(true); };
  return done ? <p className="guestbook-success" role="status">Cảm ơn lời chúc của bạn. Lời nhắn đã được gửi thành công.</p> : <form className="wish-form" onSubmit={submit} aria-busy={submission.submitting}><label>Tên hiển thị<input name="display_name" minLength={2} maxLength={60} required /></label><label>Lời chúc<textarea name="message" minLength={3} maxLength={500} required rows={3} /></label><label className="consent"><input type="checkbox" name="consent" required /> Tôi đồng ý để gia đình chia sẻ tên và lời chúc của mình.</label>{submission.error && <p className="form-error" role="alert">{submission.error}</p>}<button className="primary-button" type="submit" disabled={submission.submitting}>{submission.submitting ? "Đang gửi…" : "Gửi lời chúc"} <Heart size={16} /></button></form>;
}
