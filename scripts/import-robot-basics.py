"""Import FSC Open Docs' Robot Basics curriculum into src/content/kit-bot/.

    python scripts/import-robot-basics.py [path/to/FSCOpenDocs]

ONE-TIME IMPORT, kept for the record. Do not re-run: src/content/kit-bot/ is now
the team's own material, edited in place,
and a re-run would overwrite the Part 1/Part 2 splits, the evaluation boxes and
every prose edit made since.

Mechanical pass over docs/curriculum/robot-basics/*.md: frontmatter, link rewriting
to this site's lessons, `!!! tip` admonitions -> <RulesBox>, headings shifted one
level, an Rnn: title prefix. Originally the prose was kept verbatim; the overview's
"maps back to the Java curriculum" table and a handful of "Java Module NN" mentions
in R01–R10 were hand-edited after the first import and will need re-applying, and
R07, R08 and R09 are split into Part 1 / Part 2 pages locally (see git history for
the seams) so each fits a single sitting.
"""
import io, os, re, glob, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FSC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "..", "firstsouthcarolina", "FSCOpenDocs")
SRC = os.path.join(FSC, "docs", "curriculum", "kit-bot")
DST = os.path.join(HERE, "..", "src", "content", "kit-bot")

# module number -> (lessonId, group dir, group id, group label, groupOrder)
PHASES = [
    ("01-bootstrap", "bootstrap", "Phase 1 — Bootstrap", 1, ["00", "01", "02"]),
    ("02-first-subsystem", "first-subsystem", "Phase 2 — First Subsystem", 2, ["03", "04", "05"]),
    ("03-io-pattern", "io-pattern", "Phase 3 — Hardware via IO", 3, ["06", "07", "08", "09"]),
    ("04-kit-bot", "kit-bot", "Phase 4 — Kit Bot Integration", 4, ["10", "11", "12", "13"]),
    ("05-auto-and-capstone", "auto-and-capstone", "Phase 5 — Autonomous and Capstone", 5, ["14", "15", "RC"]),
]
NUM2PHASE = {n: p for p in PHASES for n in p[4]}

# Goal column of the FSC index, used as page descriptions.
DESCRIPTIONS = {
    "00": "Get the WPILib toolchain installed and prove it works — an empty project that compiles, a simulator that opens, and AdvantageScope ready to read it.",
    "01": "The four files every WPILib project starts from — Main, Robot, RobotContainer and Constants — and the package layout that keeps them findable.",
    "02": "TimedRobot, the 20 ms tick, the state matrix of init and periodic methods, and the scheduler that runs inside it.",
    "03": "Top-level and per-subsystem constants as public static final, and why the numbers live in one place.",
    "04": "SubsystemBase, periodic(), and a counter subsystem that has no hardware at all — the shape before the wiring.",
    "05": "Commands.runOnce and Commands.run, CommandXboxController, and binding buttons to behaviour.",
    "06": "Voltage versus percent output, encoders, current limits and gear ratios — the concepts a motor controller API is built on.",
    "07": "A working LauncherIO with a SparkMax implementation for the real robot and a FlywheelSim one for the simulator.",
    "08": "A working DriveIO with both implementations, using DifferentialDrivetrainSim for simulation.",
    "09": "Measure real kS and kV for the launcher and the drivetrain with a queued quasistatic ramp, instead of guessing 12.0 or hand-tuning shot voltages.",
    "10": "Deadband, scaling, and the stick curve from A08 applied to a real controller.",
    "11": "The default-command pattern that turns stick input into drivetrain output.",
    "12": "RobotBase.isReal() picks the IO implementation at runtime, and the subsystem code does not change.",
    "13": "DoublePublisher, DataLogManager.start(), and reading it all back in the AdvantageScope viewer.",
    "14": "A drive-forward autonomous routine and the SendableChooser pattern for picking one at the driver station.",
    "15": "Where to go after the Kit Bot — PathPlanner and Choreo, AdvantageKit, vision pipelines and sensors.",
    "RC": "The complete project: drive and launcher, real or sim, with teleop, autonomous and telemetry. The rubric for done.",
}

# FSC java-fundamentals module -> nearest mantik-garage lesson (None = unlink).
FUNDAMENTALS = {
    "index": "/java",
    "01-hello-world": "/java/java-intro",
    "02-primitive-types": "/java/java-variables",
    "03-operators-and-casting": "/java/java-math",
    "07-loops": "/java/java-for-loops",
    "15-field-modifiers-composition": "/java/java-static-final",
    "17-encapsulation": "/java/java-objects",
    "18-inheritance": "/java/java-inheritance",
    "19-polymorphism-abstract": "/java/java-abstract-classes",
    "20-interfaces": "/java/java-interfaces",
    "21-records": "/assignments/a18-records",
    "26-lambdas": "/java/java-fn-lambdas",
    "27-generics": "/java/java-generics",
    "30-streams": "/java/java-streams",
    "32-big-o": "/java/java-big-o",
    "35-queues": "/java/java-ds-queues",
    "38-packages-and-layout": "/java/java-packages",
}

ASSIGNMENT_SLUGS = {s[:3].upper(): s for s in """a01-hello-team a02-battery-sanity a03-string-toolkit
a04-scanner-echo a05-match-phase-detector a06-auto-routine-picker a07-match-countdown
a08-stick-curve-calculator a09-encoder-smoother a10-shooter-lookup a11-robot-class
a12-document-robot a13-reference-semantics a14-robot-and-battery a15-match-phase-enum
a16-subsystem-fleet a17-io-interface a18-records a19-sort-roster a20-config-validator
a21-scouting-csv a22-command-binding a23-ring-buffer a24-scouting-database
a25-alliance-lookup a26-stream-filter a27-recursion-warmups a28-big-o-reading""".split()}


def lesson_id(basename):
    stem = basename[:-3]
    if stem == "RC-capstone":
        return "rc-capstone"
    return "r" + stem


def rewrite_link(target):
    path, _, anchor = target.partition("#")
    anchor = ("#" + anchor) if anchor else ""
    if path.startswith("./"):
        name = path[2:]
        if name == "index.md":
            return "/kit-bot" + anchor
        return "/kit-bot/" + lesson_id(name) + anchor
    if path.startswith("../java-assignments/"):
        name = os.path.basename(path)
        if name == "index.md":
            return "/assignments" + anchor
        return "/assignments/" + ASSIGNMENT_SLUGS[name[:3].upper()] + anchor
    if path.startswith("../java-fundamentals/"):
        key = os.path.basename(path)[:-3]
        mapped = FUNDAMENTALS.get(key, "MISSING")
        if mapped == "MISSING":
            raise SystemExit(f"no mapping for java-fundamentals/{key}")
        return mapped
    return target


def convert_links(text):
    def repl(m):
        label, target = m.group(1), m.group(2)
        if target.startswith(("http://", "https://", "mailto:")):
            return m.group(0)
        new = rewrite_link(target)
        if new is None:
            return label  # no equivalent lesson here; keep the words, drop the link
        return f"[{label}]({new})"
    return re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", repl, text)


def convert_admonitions(lines):
    out, i = [], 0
    while i < len(lines):
        m = re.match(r'^(!!!|\?\?\?\+?)\s+(\w+)(?:\s+"([^"]*)")?\s*$', lines[i])
        if not m:
            out.append(lines[i]); i += 1; continue
        title = m.group(3) or m.group(2).capitalize()
        body = []
        i += 1
        while i < len(lines) and (lines[i].startswith("    ") or lines[i].strip() == ""):
            body.append(lines[i][4:] if lines[i].startswith("    ") else "")
            i += 1
        while body and body[-1] == "":
            body.pop()
        out.append(f'<RulesBox title="{title}">')
        out.append("")
        out.extend(body)
        out.append("")
        out.append("</RulesBox>")
    return out


def shift_headings(lines):
    out, infence = [], False
    for l in lines:
        if l.strip().startswith("```"):
            infence = not infence
        if not infence and re.match(r"^#{2,5} ", l):
            l = "#" + l
        out.append(l)
    return out


def convert(path):
    base = os.path.basename(path)
    raw = io.open(path, encoding="utf-8-sig").read().replace("\r\n", "\n")
    lines = raw.split("\n")
    # title from H1
    h1 = next(i for i, l in enumerate(lines) if l.startswith("# "))
    title = lines[h1][2:].strip()
    lines = lines[h1 + 1:]
    body = "\n".join(shift_headings(convert_admonitions(lines)))
    body = convert_links(body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip("\n") + "\n"
    return base, title, body


def frontmatter(base, title, order):
    num = "RC" if base.startswith("RC") else base[:2]
    gdir, gid, glabel, gorder, _ = NUM2PHASE[num]
    lid = lesson_id(base)
    code = "RC" if num == "RC" else "R" + num
    title = code + ": " + re.sub(r"^R\d\d: ", "", title)
    fm = [
        "---",
        f'title: "{title}"',
        f"lessonId: {lid}",
        "section: kit-bot",
        f"group: {gid}",
        f'groupLabel: "{glabel}"',
        f"groupOrder: {gorder}",
        f"order: {order}",
        f'description: "{DESCRIPTIONS[num]}"',
        "---",
        "",
    ]
    return gdir, lid, "\n".join(fm)


def main():
    files = sorted(f for f in glob.glob(SRC + "/*.md") if not f.endswith("index.md"))
    # RC-capstone sorts before digits; force it last.
    files.sort(key=lambda f: (os.path.basename(f).startswith("RC"), os.path.basename(f)))
    for order, f in enumerate(files):
        base, title, body = convert(f)
        gdir, lid, fm = frontmatter(base, title, order)
        outdir = os.path.join(DST, gdir)
        os.makedirs(outdir, exist_ok=True)
        out = os.path.join(outdir, lid + ".mdx")
        io.open(out, "w", encoding="utf-8", newline="\n").write(fm + body)
        print(f"{base:40s} -> {gdir}/{lid}.mdx  ({body.count(chr(10))} lines)")

    # overview
    base, title, body = convert(SRC + "/index.md")
    io.open(os.path.join(DST, "overview.mdx"), "w", encoding="utf-8", newline="\n").write(
        "\n".join([
            "---",
            "title: Kit Bot",
            "lessonId: overview",
            "section: kit-bot",
            "isOverview: true",
            "description: A hands-on WPILib curriculum — build the 2026 KitBot end to end, drive and launcher, with real hardware and simulation sharing one subsystem codebase.",
            "---",
            "",
        ]) + body
    )
    print("index.md -> overview.mdx")


if __name__ == "__main__":
    main()
