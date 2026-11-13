import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import EnquiryForm from '../components/EnquiryForm';
import { useSeo } from '../hooks/useSeo';
import { SITE } from '../config/site';
import { mailLink, whatsappLink } from '../utils/format';
import { FAQ } from '../content/faq';

const ADDRESS = 'Plot No. 159, Pandav Nagar, Ghaziabad, Uttar Pradesh, 201005, IN';
const HOURS = 'Mon–Sat, 10:00 AM – 6:00 PM IST';

const HELP_TOPICS = [
  ['Login & Account Issues', 'Trouble signing in, wrong credentials or problems with your profile details.'],
  ['Password Reset', 'Forgot your password or unable to reset it? We will help you regain access.'],
  ['Course Enrollment', 'Questions about eligibility, enrolling in a program and batch start dates.'],
  ['Course Access Issues', 'Cannot see your course, modules are locked or content is not loading.'],
  ['Live Class & Video Issues', 'Problems joining live classes, video buffering or audio and playback errors.'],
  ['Payment & Refund Queries', 'Payment not reflected, failed transactions, invoices and refund requests.'],
  ['Certificate Issues', 'Certificate not received, name correction or verification questions.'],
  ['Technical Support', 'App crashes, slow performance, installation or update problems.'],
  ['General App Issues', 'Any other question or feedback about the Medical Global Academy app.']
];

const DELETE_BODY = [
  'Hello Medical Global Academy Support,',
  '',
  'I would like to request deletion of my account.',
  '',
  'Registered name:',
  'Registered email:',
  'Registered phone number:',
  '',
  'Thank you.'
].join('\n');

export default function Support() {
  useSeo({
    title: 'Support',
    description: 'Get help with the Medical Global Academy app: account access, enrolment, live classes, payments, certificates and account deletion.',
    path: '/support'
  });
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Support' }]}
        eyebrow="Support"
        title="Medical Global Academy Support"
        text="Need help with the Medical Global Academy app? You are in the right place."
      />
      <div className="container">
        <section style={{ maxWidth: 820, marginBottom: 40 }}>
          <h2>About</h2>
          <p>
            Medical Global Academy is an online learning platform for doctors and healthcare professionals. Through our Android and iOS app,
            you can enrol in certificate, fellowship and PG diploma programs, access course content, attend live classes and earn
            certificates while continuing your clinical work.
          </p>
          <p>
            Our support team helps you with account access, enrolment, course and live class issues, payments, certificates and any
            technical problem you face in the app.
          </p>
        </section>

        <div className="contact-grid" id="contact-information">
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Contact information</h2>
            <div className="contact-cards">
              <a className="contact-card p0" href={`mailto:${SITE.email}`}>
                <span className="fi"><Icon name="mail" size={22} /></span>
                <div><small>Support email</small><b>{SITE.email}</b></div>
              </a>
              <a className="contact-card p1" href={`tel:${SITE.phoneRaw}`}>
                <span className="fi"><Icon name="phone" size={22} /></span>
                <div><small>Phone / WhatsApp</small><b>{SITE.phone}</b></div>
              </a>
              <a
                className="contact-card p2"
                href={whatsappLink('Hi, I need help with the Medical Global Academy app.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="fi"><Icon name="chat" size={22} /></span>
                <div><small>WhatsApp</small><b>Chat on WhatsApp</b></div>
              </a>
            </div>
            <div style={{ marginTop: 20 }}>
              <p><b>Office address</b><br />{ADDRESS}</p>
              <p><b>Support hours</b><br />{HOURS}</p>
              <p><b>Response time</b><br />We usually respond within 24–48 business hours.</p>
            </div>
          </div>

          <EnquiryForm />
        </div>

        <section style={{ marginTop: 48 }}>
          <h2>How we can help</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
            {HELP_TOPICS.map(([title, text]) => (
              <div key={title} className="form-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{title}</h3>
                <p className="small" style={{ margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="faq">
          <h2>Frequently asked questions</h2>
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>

        <section id="delete-account" style={{ maxWidth: 820, marginTop: 48 }}>
          <h2>Delete account request</h2>
          <p>You can request deletion of your Medical Global Academy account at any time by contacting our support team.</p>

          <h3>How to request deletion</h3>
          <ol>
            <li>Email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the subject “Account Deletion Request”, or message us on WhatsApp.</li>
            <li>Include your registered name, email address and phone number so we can verify your account.</li>
            <li>We will confirm your request and complete the deletion within 30 days of verification.</li>
          </ol>

          <h3>Data that will be deleted</h3>
          <ul>
            <li>Your account and profile information (name, email address, phone number)</li>
            <li>Your login credentials and saved app preferences</li>
            <li>Your course progress and activity linked to your account</li>
          </ul>

          <h3>Data that may be retained</h3>
          <ul>
            <li>Payment and transaction records, which we may need to keep for accounting, tax and legal compliance</li>
            <li>Certificate issuance records, where required to verify certificates already issued</li>
          </ul>
          <p>Retained records are kept only for as long as required by law and are not used for any other purpose.</p>

          <a className="btn btn-primary" href={mailLink('Account Deletion Request', DELETE_BODY)}>Request account deletion</a>
        </section>

        <section style={{ maxWidth: 820, margin: '48px 0' }}>
          <h2>Useful links</h2>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms">Terms &amp; Conditions</a></li>
            <li><a href="/support#contact-information">Contact Us</a></li>
          </ul>
          <h2 style={{ marginTop: 24 }}>App information</h2>
          <p><b>App name:</b> Medical Global Academy<br /><b>Platform:</b> Android &amp; iOS</p>
        </section>
      </div>
    </>
  );
}