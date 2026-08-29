import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  BadgeCheck,
  BriefcaseBusiness,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  card: "bg-[#FAF8F3] dark:bg-[#1E1B15]",
  ink: "text-[#16140F] dark:text-[#F3F0E8]",
  inkBorder: "border-[#16140F] dark:border-[#F3F0E8]",
  steel: "text-[#8B8577] dark:text-[#A39D8E]",
  hairline: "border-[#E4E0D5] dark:border-[#2C2820]",
  amber: "text-[#FF6A1A]",
  amberBg: "bg-[#FF6A1A]",
  amberBorder: "border-[#FF6A1A]",
  denim: "text-[#2C4257] dark:text-[#8FA9BE]",
  denimBorder: "border-[#2C4257] dark:border-[#8FA9BE]",
  green: "text-[#3E8E5A] dark:text-[#6FBB8A]",
};

function Rating({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star size={14} className="fill-[#FF6A1A] text-[#FF6A1A]" />
        <span className={`text-sm font-semibold ${T.ink}`} style={{ fontFamily: MONO }}>
          {rating?.toFixed(1) || "0.0"}
        </span>
      </div>
      <span className={`text-xs ${T.steel}`} style={{ fontFamily: MONO }}>
        ({count || 0})
      </span>
    </div>
  );
}

function AvailabilityBadge({ status }) {
  const available = status === "available";
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md border-2 ${
        available
          ? "bg-[#3E8E5A]/10 border-[#3E8E5A] text-[#3E8E5A] dark:text-[#6FBB8A]"
          : `bg-[#FAF8F3]/70 dark:bg-[#1E1B15]/70 ${T.hairline} ${T.steel}`
      }`}
      style={{ fontFamily: MONO }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-[#3E8E5A] animate-pulse" : "bg-current opacity-50"}`} />
      {available ? "AVAILABLE" : "OFFLINE"}
    </div>
  );
}

function Skill({ children }) {
  return (
    <span
      className={`px-2.5 py-1 rounded border text-[10px] font-medium ${T.hairline} ${T.steel}`}
      style={{ fontFamily: MONO }}
    >
      {children}
    </span>
  );
}

export default function WorkerCard({ worker }) {
  const {
    user,
    profession,
    location,
    experienceYears,
    rateAmount,
    rateType,
    ratingAvg,
    ratingCount,
    availability,
    verification,
    skills,
    jobsCompleted,
  } = worker;

  const image =
    user?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "Worker"
    )}&background=16140F&color=FAF8F3&size=500`;

  return (
    <Link
      to={`/workers/${worker._id}`}
      className={`group flex flex-col h-full overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${T.card} ${T.hairline} hover:${T.amberBorder}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-40 overflow-hidden bg-[#EFEBE2] dark:bg-[#14120D]">
        <img
          src={image}
          alt={user?.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* VERIFIED — rubber stamp */}
        {verification?.status === "verified" && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border-2 border-[#FF6A1A]/70 shadow-lg backdrop-blur-xl text-[#FF6A1A] text-[10px] font-bold"
            style={{ fontFamily: MONO }}
          >
            <BadgeCheck size={13} />
            VERIFIED
          </div>
        )}

        {/* AVAILABILITY */}
        <div className="absolute top-3 right-3 z-10">
          <AvailabilityBadge status={availability} />
        </div>

        {/* NAME OVER IMAGE */}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-xl font-semibold text-white truncate" style={{ fontFamily: DISPLAY }}>
            {user?.name?.toUpperCase()}
          </h3>
          <p className="text-[#FF9757] text-sm font-semibold mt-1" style={{ fontFamily: MONO }}>
            {profession}
          </p>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4 flex flex-col flex-1">
        <Rating rating={ratingAvg} count={ratingCount} />

        {/* INFO ROW */}
        <div className={`flex items-center gap-4 mt-4 text-sm ${T.steel}`}>
          {location?.city && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className={T.amber} />
              <span className={T.ink}>{location.city}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <BriefcaseBusiness size={14} className={T.amber} />
            <span className={T.ink}>{experienceYears || 0} yrs</span>
          </div>
        </div>

        {/* JOBS COMPLETED */}
        {jobsCompleted > 0 && (
          <div className={`flex items-center gap-2 mt-3 text-xs ${T.steel}`} style={{ fontFamily: MONO }}>
            <ShieldCheck size={13} className={T.green} />
            <span>{jobsCompleted}+ JOBS COMPLETED</span>
          </div>
        )}

        {/* SKILLS */}
        {skills?.length > 0 && (
          <div className="flex gap-2 mt-5 overflow-hidden whitespace-nowrap">
            {skills.slice(0, 2).map((skill) => (
              <Skill key={skill}>{skill}</Skill>
            ))}
            {skills.length > 4 && <Skill>+{skills.length - 4}</Skill>}
          </div>
        )}

        {/* PRICE SECTION */}
        <div className={`flex items-end justify-between mt-auto pt-3 border-t-2 border-dashed ${T.hairline}`}>
          <div>
            <p className={`text-[9px] uppercase tracking-wider ${T.steel}`} style={{ fontFamily: MONO }}>
              Starting from
            </p>
            <div className="flex items-center mt-1">
              <IndianRupee size={15} className={T.amber} />
              <span className={`text-lg font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                {rateAmount?.toLocaleString()}
              </span>
            </div>
            <p className={`text-[9px] uppercase ${T.steel}`} style={{ fontFamily: MONO }}>
              per {rateType === "hourly" ? "hour" : "day"}
            </p>
          </div>

          {/* VIEW BUTTON */}
          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-white font-semibold text-xs transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(255,106,26,0.35)] ${T.amberBg}`}
            style={{ fontFamily: MONO }}
          >
            VIEW
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}



