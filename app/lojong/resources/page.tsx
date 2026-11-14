import type { Metadata } from "next";
import { ThusnessPageShell } from "@/components/thusness/ThusnessPageShell";
import { SiteFooter } from "@/components/thusness/SiteFooter";
import styles from "../lojong.module.css";

export const metadata: Metadata = {
  title: "Lojong Resources · Thusness",
  description: "Course links, source texts, and further reading for Lojong.",
};

const anthology = "https://wisdomexperience.org/ebook/mind-training/contents/";

const readings = [
  ["Origins and source texts", "Introduction to Mind Training: The Great Collection; Atiśa’s Root Lines of Mahayana Mind Training and Annotated Root Lines; Langri Thangpa’s Eight Verses; Chekawa’s commentary on the Eight Verses."],
  ["The Wheel of Sharp Weapons", "Dharmarakṣita’s The Wheel of Sharp Weapons and The Peacock’s Neutralizing of Poison."],
  ["Seven-Point Mind Training", "Chekawa’s Seven-Point Mind Training; Sé Chilbu’s commentary; Gyalsé Thokmé Zangpo’s Unlocking in Few Words the Orally Transmitted Lines of the Seven-Point Mind Training; Jinpa’s slogan breakdown and Commitments and Precepts handouts; Atiśa’s Seven-Point Mind Training."],
  ["Ultimate awakening mind", "Sé Chilbu’s commentary; Nāgārjuna’s Commentary on the Awakening Mind (traditional attribution); Candrakīrti’s Entering the Middle Way; Tsongkhapa’s commentary on Entering the Middle Way."],
  ["Conventional awakening mind", "Śāntideva’s The Way of the Bodhisattva, chapter 8; Nāgārjuna’s Precious Garland; Ornament of the Mahāyāna Sūtras (traditionally attributed to Maitreya); Mahayana Mind Training; Public Explication of Mind Training; Bodhisattva Samantabhadra’s Mind Training; Eight Sessions Mind Training; the sūtra on purifying a bodhisattva’s field of experience and Patrul Rinpoche’s verse commentary; Jinpa’s essay on Śāntideva and exchanging self and others."],
  ["Transforming adversity", "Sé Chilbu’s commentary; Leveling Out All Conceptions; Mind Training Taking Joys and Pains onto the Path; teachings associated with Serlingpa, Chengapa, and Thokmé Zangpo."],
  ["Leveling Out All Conceptions", "Leveling Out All Conceptions and its commentary; Thokmé Zangpo’s How to Take Sicknesses and So Forth into the Path; Mind Training in a Single Session."],
  ["A lifetime of practice", "Sé Chilbu’s commentary on the five powers and measures of progress; Geshe Potowa’s Essential Drops Epistle; the Dalai Lama’s Healing Anger, a commentary on chapter 6 of The Way of the Bodhisattva."],
  ["How mind training transforms experience", "Seven-Point Mind Training and the Great Collection commentaries on the commitments and precepts."],
  ["Daily practice", "Atiśa’s Bodhisattva’s Jewel Garland; Mind Training in a Single Session; Eight Sessions Mind Training; Bodhisattva Samantabhadra’s Mind Training."],
];

export default function ResourcesPage() {
  return <div className={styles.world}>
    <ThusnessPageShell headerAside={<a href="/lojong">Back to Lojong</a>}>
      <main className={styles.companion}>
        <h1>Resources</h1>
        <h2>Thupten Jinpa’s Mind Training course</h2>
        <p>Wisdom Academy’s ten lessons include video teachings, readings, and guided practice.</p>
        <ul>
          <li><a href="https://wisdomexperience.org/mind-training/">Mind Training course overview</a></li>
          <li><a href="https://wisdomexperience.org/courses/mind-training/#lessons_list">Course outline and lessons</a></li>
          <li><a href="https://wisdomexperience.org/product/mind-training/">Mind Training: The Great Collection</a> · Edited and translated by Thupten Jinpa</li>
          <li><a href={anthology}>Browse the anthology’s 43 texts</a> · The publisher lists individual chapters. Reading some chapters requires membership.</li>
        </ul>
        <h2>Texts by lesson</h2>
        <p>Use each lesson’s reading section for the assigned excerpts. Titles also include works Jinpa discusses in the lectures.</p>
        {readings.map(([title, texts], index) => (
          <details key={title} className={styles.learnMore}>
            <summary>Lesson {index + 1} · {title}</summary>
            <p>{texts}</p>
            <p><a href={`https://wisdomexperience.org/lessons/mind-training-l${index + 1}/`}>Open lesson and readings</a></p>
          </details>
        ))}
        <h2>Direct links and further reading</h2>
        <ul>
          <li><a href="/lojong#eight-verses">Eight Verses of Mind Training</a> · Illustrated reader with Thupten Jinpa’s translation</li>
          <li><a href="https://www.drepunggomangusa.org/wp-content/uploads/2019/01/shantideva-bodhicaryavatara-wallace.pdf">The Way of the Bodhisattva</a> · Śāntideva. Chapters 6 and 8 cover patience and exchanging self and others.</li>
          <li><a href="https://wisdomexperience.org/wp-content/uploads/2020/07/Madhyamakavatara-final.pdf">Entering the Middle Way</a> · Candrakīrti, translated by Thupten Jinpa</li>
          <li><a href="https://wisdomexperience.org/product/illuminating-the-intent/">Illuminating the Intent</a> · Tsongkhapa’s commentary on Candrakīrti</li>
          <li><a href="https://www.shambhala.com/blogs/snow-lion-newsletter-archive/healing-anger">Healing Anger</a> · The Dalai Lama on patience</li>
          <li><a href="https://www.dalailama.com/">Official website of the Dalai Lama</a></li>
          <li><a href="https://www.dalailama.com/teachings/training-the-mind">The Dalai Lama’s Eight Verses commentary</a> · Verse-by-verse teachings</li>
          <li><a href="https://www.dalailama.com/teachings/training-the-mind/generating-the-mind-for-enlightenment">Generating the Mind for Enlightenment</a> · Verses for cultivating bodhicitta</li>
          <li><a href="https://www.shambhala.com/products/truthful-heart-buddhist-practices-for-connecting-with-others">A Truthful Heart: Buddhist Practices for Connecting with Others</a> · Jeffrey Hopkins</li>
        </ul>
      </main>
      <SiteFooter />
    </ThusnessPageShell>
  </div>;
}
