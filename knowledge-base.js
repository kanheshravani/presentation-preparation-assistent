/**
 * Presentation Preparation Assistant - Knowledge Base
 * Tailored for 3rd-Year Computer Engineering Students
 * Contains rich pre-engineered topics, domain heuristics, analogies, and dynamic CE topic synthesis.
 */

const CE_TOPICS_DATABASE = {
  "raft-consensus": {
    id: "raft-consensus",
    title: "Raft Consensus Algorithm",
    category: "Distributed Systems",
    tags: ["Distributed Systems", "Fault Tolerance", "Consensus", "Cloud Computing"],
    simpleExplanation: {
      eli5: "Imagine a group of 5 friends trying to agree on what movie to watch tonight when phone connections keep dropping. Raft is like choosing one trusted leader among them. Everyone texts their movie suggestions to the leader. The leader writes it down in a notebook, sends a confirmation to everyone, and only confirms the movie once at least 3 friends have agreed. If the leader goes offline, the remaining friends automatically vote for a new leader within seconds.",
      coreProblem: "In distributed computing, multiple independent servers must agree on shared state (like bank balances or cluster configurations) even when servers crash or network cables fail. Paxos was notoriously hard to understand and implement; Raft was designed specifically for understandability without sacrificing safety.",
      keyPillars: [
        { title: "Leader Election", desc: "Nodes start as Followers. If they don't hear a heartbeat within a randomized election timeout, they transition to Candidate and request votes. The majority wins." },
        { title: "Log Replication", desc: "The Leader accepts client commands, appends them to its log, and broadcasts AppendEntries RPCs. Once replicated on a majority of nodes, the entry is committed." },
        { title: "Safety & Consistency", desc: "Raft guarantees that if any server applies a log entry at a given index to its state machine, no other server will ever apply a different entry for that index." }
      ],
      mentalModel: "Follower -> (Election Timeout) -> Candidate -> (Majority Votes) -> Leader -> (Heartbeats & Log Entries) -> Followers",
      examinerFocus: "External examiners will probe: 'What happens during network partitions (split-brain)?', 'Why are election timeouts randomized?', and 'Why is an odd number of nodes (3, 5, 7) always preferred?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: The Quest for Consensus",
        slideBullets: [
          "Topic: Raft Consensus Algorithm for Distributed Systems",
          "Presented by: [Your Name], 3rd Year B.Tech Computer Engineering",
          "Core Theme: How distributed machines agree in an unreliable world"
        ],
        script: "Respected faculty, examiners, and dear peers. Imagine transferring money between two bank servers when the fiber-optic cable between them suddenly snaps. How do distributed computers stay 100% consistent when machines crash and networks partition? Today, I will present the Raft Consensus Algorithm—the backbone behind modern distributed engines like etcd, Kubernetes, and CockroachDB—designed specifically to make distributed consensus understandable and robust.",
        timing: "60-75s",
        visualCue: "Make confident eye contact; point toward the title slide and transition directly into the motivation.",
        examinerTrap: "Examiners may ask: 'Where in industry is Raft actually used?' Answer: etcd in Kubernetes, Consul, CockroachDB, and Apache Kafka (KRaft)."
      },
      {
        slideNumber: 2,
        title: "The Problem: Why is Consensus Hard?",
        slideBullets: [
          "The Byzantine & Fail-Stop fault models in distributed networks",
          "Network latency, packet drops, and sudden node crashes",
          "The Paxos Paradox: Mathematically proven, but notoriously difficult to implement",
          "Goal: Maintain a replicated state machine across independent nodes"
        ],
        script: "Before Raft, Paxos was the gold standard. However, Paxos is notoriously difficult to comprehend and even harder to implement correctly in production. In a distributed cluster, nodes experience unpredictable network delays, temporary disconnections, and sudden crashes. Our goal is simple yet hard: maintain a Replicated State Machine where all healthy nodes execute identical operations in the exact same sequence. Raft breaks this daunting problem into three independent, manageable sub-problems: Leader Election, Log Replication, and Safety.",
        timing: "90s",
        visualCue: "Gesture with three fingers when stating 'Leader Election, Log Replication, and Safety' to show structured thinking.",
        examinerTrap: "They might ask: 'Does Raft solve Byzantine faults (malicious tampering)?' Emphasize: 'No, Raft assumes non-Byzantine fail-stop/crash-recovery faults, not malicious nodes.'"
      },
      {
        slideNumber: 3,
        title: "Node Roles & The Lifecycle",
        slideBullets: [
          "Three States: Follower, Candidate, Leader",
          "Term Numbers: Logical clocks that act as timestamps",
          "Transitions: Followers convert to Candidates on election timeout; Leaders maintain authority via Heartbeats"
        ],
        script: "As shown in this state diagram, every node in a Raft cluster exists in one of three states: Follower, Candidate, or Leader. At startup, all nodes are Followers. They remain passive as long as they receive regular heartbeat signals from a Leader. If a Follower hears nothing for a randomized duration called the Election Timeout—typically between 150 to 300 milliseconds—it assumes the Leader is dead, increments its logical term number, transitions to Candidate, and broadcasts a RequestVote RPC.",
        timing: "90s",
        visualCue: "Trace the transition loop on the diagram: Follower -> Candidate -> Leader -> Follower.",
        examinerTrap: "They will ask: 'Why must the election timeout be randomized?' Answer: To prevent split votes where multiple candidates split the votes equally and cause continuous deadlocks."
      },
      {
        slideNumber: 4,
        title: "Leader Election & Split-Vote Prevention",
        slideBullets: [
          "Randomized Election Timeouts (150ms - 300ms)",
          "Majority Quorum Rule: Nodes require floor(N/2) + 1 votes to win",
          "One Vote Per Term constraint to ensure uniqueness",
          "Split-vote resolution: Next randomized timer expires first"
        ],
        script: "The genius of Raft is in its randomized election timeouts. Because each node's timer is randomly picked from an interval like 150 to 300 milliseconds, one node's timer almost always expires first. It casts a vote for itself, immediately asks peers for votes, and upon gathering a majority quorum—which is (N/2)+1 votes—it becomes the cluster Leader. If two candidates time out simultaneously, causing a split vote, their randomized timers reset and another candidate cleanly wins in the next term.",
        timing: "90s",
        visualCue: "Point to the quorum calculation: for 5 nodes, quorum is 3. For 3 nodes, quorum is 2.",
        examinerTrap: "Question: 'What if we have 4 nodes instead of 3? Does it increase fault tolerance?' Answer: No! 3 nodes tolerate 1 failure ((3/2)+1 = 2). 4 nodes still only tolerate 1 failure ((4/2)+1 = 3), so odd numbers are strictly optimal."
      },
      {
        slideNumber: 5,
        title: "Log Replication & The Commit Index",
        slideBullets: [
          "Clients send write commands exclusively to the Leader",
          "Leader appends command to local log (Uncommitted)",
          "Leader sends AppendEntries RPC to all Followers",
          "Once replicated on majority of nodes, Leader commits and notifies followers"
        ],
        script: "Once a leader is elected, all client writes flow solely through the Leader. When a client sends a command, say 'set x = 10', the leader appends it to its own log. It then sends an AppendEntries RPC to all followers. Followers verify log continuity, append the entry, and reply with success. Once the leader receives positive acknowledgments from a majority of nodes, it officially commits the entry, applies it to its state machine, and returns success to the client. On subsequent heartbeats, followers are told the new commit index and apply it too.",
        timing: "90s",
        visualCue: "Use your hands to demonstrate the two-phase flow: Leader writes locally -> pushes to cluster -> confirms majority -> commits.",
        examinerTrap: "Question: 'Can an uncommitted entry on a failed leader be overwritten?' Answer: Yes, an uncommitted entry can be overwritten by a newly elected leader whose log is more up-to-date."
      },
      {
        slideNumber: 6,
        title: "Network Partitions: The Split-Brain Scenario",
        slideBullets: [
          "Scenario: 5-node cluster splits into [A, B] and [C, D, E]",
          "Minority partition [A, B] cannot achieve quorum (needs 3 votes)",
          "Majority partition [C, D, E] elects a leader and continues commits",
          "Reconnection: Minority nodes rollback conflicting uncommitted logs"
        ],
        script: "Let us examine the ultimate acid test: a network partition. Imagine a 5-node cluster split by a network switch failure into two isolated partitions: nodes A and B on one side, and C, D, and E on the other. If node A was the old leader, it might still receive client requests, but it can never commit them because it can only reach 2 nodes, failing the 3-node majority requirement. Meanwhile, the majority side C, D, and E cleanly elects a new leader and processes writes normally. When the network heals, nodes A and B discover the higher term, step down, and overwrite their uncommitted entries with the authoritative log.",
        timing: "90-100s",
        visualCue: "Point clearly to the minority side showing 2/5 (no quorum) vs majority side showing 3/5 (quorum active).",
        examinerTrap: "Examiners love this: 'Can stale reads happen on the minority leader?' Answer: Yes, if read leases or read-index checks aren't enforced, which is why Raft leaders must confirm leadership with a majority before returning reads."
      },
      {
        slideNumber: 7,
        title: "Conclusion & Industrial Impact",
        slideBullets: [
          "Raft delivers equivalence to Paxos with superior implementability",
          "Powers mission-critical cloud backbones: Kubernetes (etcd), HashiCorp Consul",
          "Key Takeaway: Understandability directly improves system reliability"
        ],
        script: "To conclude, Raft proved that understandable algorithms lead to more reliable software. By decomposing consensus into distinct, verifiable phases—leader election, log replication, and safety guarantees—Raft made distributed state machines accessible to software engineers worldwide. Today, billions of cloud containers rely on Raft daily via Kubernetes etcd. Thank you for your time, and I am now eager to take your questions.",
        timing: "45-60s",
        visualCue: "Lower speaking pace, pause, stand straight, smile, and make direct eye contact with the examiners.",
        examinerTrap: "Ready for viva. Keep your voice steady and acknowledge questions respectfully."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-raft-1",
        category: "Core Concept",
        question: "Why does Raft require an odd number of servers (e.g., 3, 5, or 7) rather than an even number?",
        modelAnswer: "An odd number of servers maximizes fault tolerance for a given hardware cost. Quorum requires floor(N/2) + 1 servers. In a 3-node cluster, quorum is 2, tolerating 1 failure. In a 4-node cluster, quorum is 3, which STILL only tolerates 1 failure while requiring more servers. Additionally, an odd number eliminates the risk of equal 50-50 network splits where neither side can form a majority.",
        examinerIntent: "Testing mathematical grasp of distributed quorum and cost-benefit trade-offs.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-raft-2",
        category: "Edge Case & Traps",
        question: "What happens if a leader crashes while replicating a log entry to only 2 out of 5 nodes?",
        modelAnswer: "Because the entry was only on 2 out of 5 nodes, it was NOT committed (quorum requires 3). When the leader crashes, the remaining 3 nodes will hold an election. The candidate with the most up-to-date log (higher term or longer log at same term) will win. If the newly elected leader does not have this entry, it will overwrite the uncommitted entry on the followers with its own log entries when sending AppendEntries. This preserves safety without data corruption.",
        examinerIntent: "Testing if the student understands the exact definition of a committed log entry.",
        difficulty: "Tricky"
      },
      {
        id: "viva-raft-3",
        category: "Cross-Question",
        question: "Why can't two leaders ever be elected in the exact same term in Raft?",
        modelAnswer: "Raft guarantees at most one leader per term through the Election Safety property. This is enforced because each server can vote for at most one candidate in a given term (on a first-come, first-served basis), and a candidate must receive votes from a strict majority (floor(N/2) + 1) of all servers. Two different majorities in a set of N servers must overlap by at least one server. That overlapping server cannot have voted for both candidates in the same term, mathematically preventing dual leaders.",
        examinerIntent: "Testing pigeonhole principle / majority intersection theorem.",
        difficulty: "Advanced"
      },
      {
        id: "viva-raft-4",
        category: "Real-World / Architecture",
        question: "How does Raft handle Log Compaction when logs grow infinitely large on disk?",
        modelAnswer: "Raft uses Snapshotting for log compaction. Each node periodically writes its entire state machine state to a snapshot file on persistent disk and discards all preceding log entries up to that snapshot's index. If a follower falls so far behind that the leader has already discarded the logs it needs, the leader sends an InstallSnapshot RPC instead of AppendEntries, streaming the snapshot directly to catch the follower up.",
        examinerIntent: "Testing real-world systems awareness beyond basic classroom theory.",
        difficulty: "Practical"
      }
    ],
    quickRevision: {
      elevatorPitch: "Raft is a distributed consensus algorithm designed to keep a cluster of servers synchronized under crash faults. It operates by electing a single distinguished Leader through randomized election timeouts. The Leader exclusively accepts client writes, replicates them across a majority of nodes via AppendEntries RPCs, and commits them, guaranteeing identical state machine execution across the entire cluster.",
      mustKnowPoints: [
        "Three distinct node states: Follower, Candidate, Leader.",
        "Terms act as logical timestamps; every term has at most 1 leader.",
        "Quorum rule: Actions require strictly greater than 50% majority (floor(N/2)+1).",
        "Randomized timeouts (150-300ms) prevent split-vote deadlocks.",
        "Raft assumes non-Byzantine crash-recovery failures, not malicious attacks.",
        "Log entries are only committed when written to persistent storage on a majority."
      ],
      examinerGotchas: [
        "Don't confuse Paxos and Raft: Paxos is symmetric/leaderless or multi-paxos; Raft is strictly strong-leader based.",
        "Don't say Raft prevents all partitions; say Raft ensures the minority partition cannot make conflicting state updates.",
        "Always state the time complexity of leader election: bounded by election timeout plus a round-trip time."
      ],
      keyTerms: [
        { term: "Quorum", def: "The minimum number of members (majority) of a cluster that must agree before a change is committed." },
        { term: "Heartbeat", def: "An empty AppendEntries RPC sent periodically by the leader to suppress follower election timeouts." },
        { term: "Term", def: "An arbitrary logical clock epoch used to detect obsolete information like stale leaders." },
        { term: "State Machine Replication", def: "A technique for building fault-tolerant services by running an identical deterministic program on multiple servers." }
      ]
    }
  },

  "docker-containers": {
    id: "docker-containers",
    title: "Docker & Linux Container Internals",
    category: "Cloud & Systems",
    tags: ["Operating Systems", "Cloud Computing", "Virtualization", "DevOps"],
    simpleExplanation: {
      eli5: "Think of a Virtual Machine like building a whole separate house with its own plumbing, electricity, and foundation just to house one guest. A Docker container is like renting a private room in an existing hotel: you share the hotel's underlying plumbing and foundation (the Linux OS Kernel), but your room has its own lock, furniture, and private bathroom (isolated namespaces and resource limits). It starts in milliseconds instead of minutes.",
      coreProblem: "Developers spent decades battling the 'It works on my machine!' syndrome. Traditional Virtual Machines solved environment drift but were heavy, slow to boot, and consumed gigabytes of RAM by duplicating entire guest operating systems.",
      keyPillars: [
        { title: "Linux Namespaces (Isolation)", desc: "Isolates what the process can see: PID (processes), NET (networking), MNT (mount points), and IPC." },
        { title: "Control Groups / cgroups (Resource Metering)", desc: "Restricts how much hardware the process can consume: CPU cores, RAM limits, disk I/O bandwidth." },
        { title: "OverlayFS (Copy-on-Write Storage)", desc: "Layered, immutable image architecture allowing instant startup and massive disk deduplication." }
      ],
      mentalModel: "App Code + Dependencies -> Dockerfile -> Layered Read-Only Image -> Container Instance (Namespaces + Cgroups + Read-Write Layer)",
      examinerFocus: "Examiners will ask: 'Does a container have its own kernel?', 'What is the exact technical difference between cgroups and namespaces?', and 'How does Copy-on-Write (CoW) work?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: Demystifying Containerization",
        slideBullets: [
          "Topic: Docker & Linux Container Internals",
          "Presented by: [Your Name], 3rd Year Computer Engineering",
          "Core Theme: How OS-level virtualization revolutionized software delivery"
        ],
        script: "Good morning respected professors and fellow students. Every software engineer has faced the dreaded excuse: 'It works on my machine, why is it failing in production?' Today, we explore Docker—not just as a CLI tool, but through the deep low-level Linux kernel primitives that power it: Namespaces, Control Groups, and Layered File Systems.",
        timing: "60s",
        visualCue: "Establish rapport; emphasize that this presentation focuses on low-level OS mechanics, not just docker run commands.",
        examinerTrap: "Examiners will immediately check if you know what Docker actually is: 'Is Docker a hypervisor?' Answer: 'No, Docker is a container runtime that leverages OS-level primitives, not a hypervisor.'"
      },
      {
        slideNumber: 2,
        title: "VMs vs Containers: The Architectural Divide",
        slideBullets: [
          "Virtual Machines: Hardware virtualization via Type-1/Type-2 Hypervisors (Guest OS overhead)",
          "Containers: OS-level virtualization sharing a single Host Linux Kernel",
          "Metrics: Boot time (Seconds vs Milliseconds), Size (Gigabytes vs Megabytes), Density (10s vs 1000s per host)"
        ],
        script: "To appreciate containers, we must contrast them with Virtual Machines. A VM abstracts physical hardware. Each VM carries a complete Guest Operating System, its own kernel, system binaries, and device drivers, resulting in gigabytes of memory footprint and minutes of boot time. Containers, on the other hand, abstract the operating system. All containers run natively on the host Linux kernel, sharing kernel threads while remaining strictly isolated. This yields sub-second startups and 10x higher server density.",
        timing: "90s",
        visualCue: "Highlight the architectural stack comparison: show Hypervisor + Guest OS vs Container Engine + Shared Host Kernel.",
        examinerTrap: "Trap: 'Can you run a native Windows binary inside a Linux container on a Linux host?' Answer: 'No, because containers share the host kernel. Windows binaries require the Windows NT kernel.'"
      },
      {
        slideNumber: 3,
        title: "The Heart of Isolation: Linux Namespaces",
        slideBullets: [
          "PID Namespace: Process isolation (Container sees itself as PID 1)",
          "NET Namespace: Dedicated virtual network interfaces, routing tables, port mappings",
          "MNT & UTS Namespaces: Isolated filesystem mounts and custom hostnames",
          "IPC & User Namespaces: Inter-process communication and mapped root privileges"
        ],
        script: "How does a container believe it is the only program running on a machine? The answer is Linux Namespaces. Namespaces control what a process can SEE. Inside a container, the process sees itself as PID 1—the root init process—while on the host machine, it is merely an ordinary process with PID 18452. The NET namespace provides a dedicated virtual ethernet pair, private routing tables, and IP addresses. The Mount namespace isolates directory trees, and UTS isolates hostnames.",
        timing: "90s",
        visualCue: "Draw the mental contrast: Host PID table showing PID 18452 mapping directly to Container PID 1.",
        examinerTrap: "Examiner question: 'Which system call creates a new namespace in C/Linux?' Answer: The `clone()` system call with flags like `CLONE_NEWPID` or `CLONE_NEWNET`, or `unshare()`."
      },
      {
        slideNumber: 4,
        title: "Resource Governance: Control Groups (cgroups)",
        slideBullets: [
          "Namespaces isolate what you SEE; cgroups limit what you USE",
          "Subsystems: cpu, memory, blkio, pids (prevents fork bombs)",
          "Hard limits (OOM Killer) vs Soft limits (CPU shares)",
          "Exposed in Linux as pseudo-filesystem at /sys/fs/cgroup"
        ],
        script: "While namespaces handle visibility, Control Groups, or cgroups, govern resource allocation. They answer: what happens if a buggy container runs an infinite loop or consumes all RAM? With cgroups, we define strict boundaries. We can allocate exactly 2 CPU cores and 512 MB of RAM. If a container breaches its memory limit, the Linux kernel's Out-Of-Memory (OOM) Killer terminates it without affecting other containers. cgroups also enforce PID limits, preventing malicious fork-bombs from crashing the host.",
        timing: "90s",
        visualCue: "Point to the /sys/fs/cgroup path representation and contrast limits vs isolation.",
        examinerTrap: "Question: 'What happens when a container exceeds its memory limit vs CPU limit?' Answer: 'CPU is throttleable (processes just run slower); memory is non-throttleable, triggering OOM killer termination.'"
      },
      {
        slideNumber: 5,
        title: "Storage Engine: UnionFS & Overlay2",
        slideBullets: [
          "Layered architecture: Each Dockerfile command generates an immutable read-only layer",
          "Copy-on-Write (CoW) strategy: Modifying a file copies it to the top writable layer",
          "Efficiency: Hundreds of containers share identical base image layers on disk"
        ],
        script: "How can 50 containers running Ubuntu take up only a few megabytes of extra disk space instead of 50 gigabytes? The secret is Union File Systems, specifically OverlayFS. A Docker image consists of stacked, read-only layers. When you run a container, Docker adds a thin, ephemeral Read-Write layer on top. If a container needs to modify a file from an underlying layer, OverlayFS performs a Copy-on-Write: it copies the file up to the writable layer before editing. The underlying base layers remain untouched and shared.",
        timing: "90s",
        visualCue: "Illustrate the stack: Base OS (Read-Only) -> Dependencies (Read-Only) -> App Code (Read-Only) -> Container Writable Layer (Read-Write).",
        examinerTrap: "Question: 'What happens to files written inside the container when the container is deleted?' Answer: 'They are lost with the writable layer unless persisted via Docker Volumes or Bind Mounts.'"
      },
      {
        slideNumber: 6,
        title: "Security & Container Escape Risks",
        slideBullets: [
          "Containers are NOT security boundaries like hardware VMs",
          "Linux Capabilities: Dropping root power (e.g. CAP_SYS_ADMIN, CAP_NET_ADMIN)",
          "Kernel attack surface: A single kernel panic crashes all co-located containers",
          "Mitigations: Rootless Docker, AppArmor, Seccomp system call filtering"
        ],
        script: "A vital engineering realization is that containers share the host kernel. Therefore, a container is not as hard a security boundary as a hardware virtual machine. If a container runs with full root privileges and CAP_SYS_ADMIN, a compromised container can escape to the host. In modern production, we enforce Seccomp profiles to blacklist dangerous system calls, use AppArmor, run rootless containers, and strip unneeded Linux capabilities.",
        timing: "80s",
        visualCue: "Emphasize security awareness—examiners love third-year students who understand production security constraints.",
        examinerTrap: "Trap: 'If root inside a container runs, is it root on the host?' Answer: 'By default, yes, UID 0 in container is UID 0 on host unless User Namespaces (userns-remap) are enabled!'"
      },
      {
        slideNumber: 7,
        title: "Summary & Engineering Takeaways",
        slideBullets: [
          "Containers = Namespaces (view) + Cgroups (limits) + Layered FS (storage)",
          "Enables reproducible microservices, CI/CD, and Kubernetes orchestration",
          "Open for questions & technical viva voce"
        ],
        script: "To summarize: Docker is not magic. It is an elegant orchestration of three Linux kernel features: Namespaces to isolate view, cgroups to enforce resource limits, and OverlayFS for efficient layered storage. Understanding these foundational primitives empowers us to build resilient, secure cloud-native architectures. Thank you, and I look forward to your questions.",
        timing: "45s",
        visualCue: "Conclude with confidence and prompt the examination panel.",
        examinerTrap: "Ready for viva."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-docker-1",
        category: "Fundamental",
        question: "Explain the exact difference between Linux Namespaces and Control Groups (cgroups).",
        modelAnswer: "Linux Namespaces provide VISIBILITY isolation—they govern what system resources a process can SEE (e.g., process tree via PID namespace, network interfaces via NET namespace, mount points via MNT namespace). In contrast, Control Groups (cgroups) provide RESOURCE allocation and metering—they govern how much physical hardware a process group can CONSUME (e.g., CPU cycles, memory quotas, block I/O, number of spawned PIDs).",
        examinerIntent: "Testing whether the student understands kernel-level primitives versus surface-level CLI commands.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-docker-2",
        category: "Tricky",
        question: "Why does running 'docker run -p 80:80' require iptables rules on the host?",
        modelAnswer: "Because the container has its own private NET namespace and virtual ethernet interface (veth) attached to a bridge (docker0). The container has a private IP that is not directly routable from outside the host. Docker configures iptables Network Address Translation (NAT / PREROUTING rules) on the host to forward incoming traffic on host port 80 to the container's private IP and port 80.",
        examinerIntent: "Connecting networking knowledge (NAT, IP routing, bridges) with OS virtualization.",
        difficulty: "Tricky"
      },
      {
        id: "viva-docker-3",
        category: "Edge Case",
        question: "What is the Copy-on-Write (CoW) mechanism in Docker image storage?",
        modelAnswer: "In Docker's storage driver (like Overlay2), image layers are strictly read-only and shared across all containers. When a container attempts to modify an existing file that lives in a lower read-only image layer, the storage driver first copies that file up into the container's topmost read-write layer before applying the modification. The original image layer remains completely unchanged, preserving immutability and saving disk space.",
        examinerIntent: "Testing file system and OS caching comprehension.",
        difficulty: "Practical"
      },
      {
        id: "viva-docker-4",
        category: "Security",
        question: "Can a process inside a container cause a Kernel Panic that crashes the entire physical host?",
        modelAnswer: "Yes, it can. Because all containers share the same underlying host Linux kernel, if a process inside a container triggers an unhandled kernel bug or kernel panic through a vulnerable system call or driver, the entire host OS and all other co-located containers will crash. This is why multi-tenant public clouds often wrap containers in lightweight VMs (like AWS Firecracker or Google gVisor).",
        examinerIntent: "Testing architectural security boundaries and advanced awareness.",
        difficulty: "Advanced"
      }
    ],
    quickRevision: {
      elevatorPitch: "Docker is an operating-system-level virtualization platform that packages applications and dependencies into portable, isolated containers. Unlike Virtual Machines that emulate hardware and duplicate guest kernels, Docker runs directly on the host Linux kernel using Namespaces for process isolation, Control Groups for CPU/RAM metering, and Union File Systems for layered, copy-on-write image storage.",
      mustKnowPoints: [
        "Containers share the host OS kernel; VMs emulate hardware via hypervisors.",
        "Namespaces = Isolation (PID, NET, MNT, IPC, UTS, USER).",
        "cgroups = Limits (CPU shares, RAM quota, blkio, pids).",
        "OverlayFS uses stacked read-only image layers + 1 top read-write container layer.",
        "Copy-on-Write ensures modifications never corrupt underlying base images.",
        "A container process is just a regular host process running with restricted kernel flags."
      ],
      examinerGotchas: [
        "Never say 'Docker contains an OS'. It contains user-space binaries and libraries, not a kernel.",
        "Remember that deleting a container wipes its writable layer unless Volumes are used.",
        "Know the default bridge network name: `docker0`."
      ],
      keyTerms: [
        { term: "Namespace", def: "A Linux kernel feature that partitions kernel resources so one set of processes sees a different set than another." },
        { term: "cgroup", def: "A Linux kernel feature that limits, accounts for, and isolates resource usage (CPU, memory, disk I/O) of process groups." },
        { term: "UnionFS / Overlay2", def: "A file system service that implements a union mount for other file systems, creating a single coherent view of stacked layers." },
        { term: "OOM Killer", def: "Out-Of-Memory Killer: a Linux kernel mechanism that sacrifices low-priority or quota-breaching processes when RAM is exhausted." }
      ]
    }
  },

  "transformer-architecture": {
    id: "transformer-architecture",
    title: "Transformer Architecture & Self-Attention in LLMs",
    category: "AI & Machine Learning",
    tags: ["Machine Learning", "Deep Learning", "NLP", "Artificial Intelligence"],
    simpleExplanation: {
      eli5: "Imagine reading a sentence word by word through a narrow straw: by the time you reach word 20, you forgot how word 1 was connected. That was how old RNNs worked. The Transformer is like looking at the entire page at once with magical highlighter pens. For every single word, it shoots rays of attention to every other word simultaneously, immediately knowing that in 'The bank of the river overflowed', the word 'bank' refers to nature, not money.",
      coreProblem: "Recurrent Neural Networks (RNNs and LSTMs) processed text sequentially (O(N) time complexity). This created two fatal bottlenecks: long-range gradient vanishing (forgetting distant context) and an inability to parallelize training on GPUs.",
      keyPillars: [
        { title: "Scaled Dot-Product Attention", desc: "Calculates relevance between Query (Q) and Key (K) vectors, normalized by sqrt(d_k) and softmax, to weigh Value (V) vectors." },
        { title: "Multi-Head Attention", desc: "Runs attention in multiple parallel subspaces so the model simultaneously tracks syntax, semantics, and coreference." },
        { title: "Positional Encoding", desc: "Injects sinusoidal or learned sequence order signals since self-attention is inherently permutation-invariant." }
      ],
      mentalModel: "Input Tokens -> Embeddings + Positional Encoding -> Multi-Head Self-Attention -> Add & Norm -> Feed-Forward Network -> Add & Norm -> Output",
      examinerFocus: "Examiners will ask: 'Why divide by square root of d_k in attention?', 'Why do we need positional encodings?', and 'What is the computational complexity of self-attention?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: The Architecture That Changed AI",
        slideBullets: [
          "Topic: The Transformer Architecture & Self-Attention Mechanism",
          "Paper: 'Attention Is All You Need' (Vaswani et al., 2017)",
          "Presented by: [Your Name], 3rd Year Computer Engineering"
        ],
        script: "Respected faculty and fellow engineers. Today, artificial intelligence is dominated by Large Language Models like GPT-4 and Gemini. But what made this revolution possible? In 2017, researchers at Google published 'Attention Is All You Need', replacing sequential recurrent networks with the Transformer. Today, we unpack the mathematical and architectural intuition behind Self-Attention, Multi-Head projections, and parallel computation.",
        timing: "60s",
        visualCue: "Show enthusiasm; reference both the original 2017 landmark paper and modern real-world LLM relevance.",
        examinerTrap: "Trap question: 'Who wrote the paper and what was its original task?' Answer: Vaswani et al., Google Brain/Research, originally designed for Machine Translation (English to German/French)."
      },
      {
        slideNumber: 2,
        title: "The Fall of RNNs & Motivation for Transformers",
        slideBullets: [
          "RNN/LSTM Bottleneck: Sequential dependency h_t = f(h_{t-1}, x_t) prevents GPU parallelization",
          "Information loss across long sequences: Vanishing & exploding gradients",
          "Transformer Solution: Discard recurrence entirely; process all tokens in parallel via Attention"
        ],
        script: "Before Transformers, NLP was ruled by Recurrent Neural Networks and LSTMs. However, RNNs have an inherent architectural bottleneck: to compute hidden state h_t, you MUST wait for h_{t-1}. This sequential dependency prevents parallel execution across GPU cores. Furthermore, as sentences grow beyond 50 tokens, the hidden state compresses and forgets distant context. The Transformer threw away recurrence entirely, processing all sequence tokens simultaneously in parallel.",
        timing: "90s",
        visualCue: "Contrast sequential chain of RNN blocks vs parallel matrix multiplication of Transformers.",
        examinerTrap: "Question: 'What is the theoretical path length between any two words in an RNN vs Transformer?' Answer: 'In RNN it is O(N); in Transformer it is O(1) direct connection!'"
      },
      {
        slideNumber: 3,
        title: "The Math: Scaled Dot-Product Attention",
        slideBullets: [
          "Vectors: Query (Q), Key (K), Value (V) derived via learned weight matrices",
          "Formula: Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V",
          "The scaling factor 1/sqrt(d_k) prevents softmax gradient saturation"
        ],
        script: "At the core of the Transformer is Scaled Dot-Product Attention. For every token, we project its embedding into three distinct vectors: Query, Key, and Value, inspired by information retrieval. Think of Query as what a word is searching for, Key as what each word offers, and Value as its actual semantic content. We take the dot product of Query and Key transposed, which measures relevance. We divide by the square root of vector dimension d_k to prevent dot products from growing excessively large, apply Softmax to get probability distribution, and multiply by Value.",
        timing: "100s",
        visualCue: "Walk through the equation term by term on the slide: Q * K^T, then scaling, then softmax, then V.",
        examinerTrap: "Examiners will always ask: 'Why divide by sqrt(d_k)?' Answer: 'For large d_k, dot products grow large in magnitude, pushing softmax into regions with extremely tiny gradients (vanishing gradients). Scaling stabilizes variance to 1.'"
      },
      {
        slideNumber: 4,
        title: "Multi-Head Attention: Diverse Subspaces",
        slideBullets: [
          "Single attention averages across all relationships; Multi-Head attends to different aspects",
          "H parallel heads project Q, K, V into d_k / H dimensional spaces",
          "Outputs are concatenated and multiplied by output matrix W_O",
          "Captures syntax, semantic subject-verb agreement, and coreferences simultaneously"
        ],
        script: "Why do we need 'Multi-Head' attention instead of just one big attention calculation? Because words have multifaceted relationships. In the sentence 'The bank of the river', one attention head might focus on syntactic dependency (noun-preposition), while another head focuses on contextual semantic disambiguation ('bank' near 'river'). By splitting our vectors across H parallel heads (typically 8 heads), each head learns to attend to different relational subspaces before their outputs are concatenated.",
        timing: "90s",
        visualCue: "Show 8 parallel streams joining back together into a linear projection.",
        examinerTrap: "Question: 'Does Multi-Head Attention increase the computational cost compared to single head with full dimension?' Answer: 'No, because each head operates on d_model / h dimensions, keeping total operations roughly equal.'"
      },
      {
        slideNumber: 5,
        title: "Positional Encoding & Residual Connections",
        slideBullets: [
          "Permutation Invariance: Self-attention has no innate sense of word order",
          "Sinusoidal or Learned Positional Encodings inject order information",
          "Residual Add & LayerNorm connections ensure deep gradient propagation"
        ],
        script: "Because attention calculates dot products between all pairs simultaneously, it is completely permutation-invariant: 'dog bites man' looks identical to 'man bites dog'. To fix this, we add Positional Encodings directly to the input embeddings. The original paper used sinusoidal functions of varying frequencies, allowing the model to easily learn relative positions. Furthermore, each sub-layer contains a residual Skip Connection followed by Layer Normalization, preventing gradient degradation across 96+ layers.",
        timing: "90s",
        visualCue: "Emphasize the Skip Connection arrows bypassing the attention layer into the Add & Norm block.",
        examinerTrap: "Question: 'Why Layer Normalization instead of Batch Normalization in Transformers?' Answer: 'Batch Norm depends on batch statistics and fails on variable sentence lengths; Layer Norm normalizes across features for each individual token independently.'"
      },
      {
        slideNumber: 6,
        title: "Computational Complexity & Modern Evolution",
        slideBullets: [
          "Quadratic Bottleneck: Attention matrix is O(N^2) with sequence length N",
          "Encoder-Only (BERT) vs Decoder-Only (GPT) vs Encoder-Decoder (T5)",
          "Modern Innovations: FlashAttention, Rotary Position Embeddings (RoPE), KV-Caching"
        ],
        script: "Now, let us discuss the primary engineering challenge: the quadratic complexity bottleneck. Because every token attends to every other token, computing QK^T requires O(N^2) time and memory where N is sequence length. For long contexts like 100k tokens, naive attention runs out of GPU VRAM. Modern LLMs solve this with FlashAttention (tiling in GPU SRAM), Rotary Position Embeddings (RoPE), and KV-Caching during autoregressive generation. Most modern LLMs use decoder-only architectures with causal masking.",
        timing: "90s",
        visualCue: "Explain causal masking briefly by showing how token N is masked from seeing token N+1.",
        examinerTrap: "Question: 'What is causal masking and why is it required in GPT?' Answer: 'In autoregressive generation, tokens must not attend to future tokens, so future positions are masked with -infinity before softmax.'"
      },
      {
        slideNumber: 7,
        title: "Conclusion & Discussion",
        slideBullets: [
          "Transformers eliminated recurrence, enabling massive GPU scaling",
          "Self-Attention is now the standard across NLP, Computer Vision (ViT), and Multimodal AI",
          "Ready for technical questions"
        ],
        script: "In conclusion, the Transformer's shift from sequential recurrence to parallel self-attention was the catalyst for modern deep learning. Its mathematical elegance, coupled with hardware-friendly matrix multiplications, has extended far beyond language to Vision Transformers, audio, and robotics. Thank you very much, and I welcome your viva questions.",
        timing: "45s",
        visualCue: "End smoothly and maintain confident posture.",
        examinerTrap: "Ready for viva."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-tf-1",
        category: "Mathematical",
        question: "Why do we divide by sqrt(d_k) in the Scaled Dot-Product Attention formula?",
        modelAnswer: "For large values of vector dimension d_k, the dot products Q * K grow large in magnitude. When these large values are passed into the Softmax function, the softmax distribution becomes extremely sharp (peaked), which pushes gradients toward near-zero values. Dividing by the scaling factor sqrt(d_k) normalizes the variance of the dot products back to 1, preventing the vanishing gradient problem during backpropagation.",
        examinerIntent: "Testing mathematical rigor and understanding of backpropagation dynamics in softmax.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-tf-2",
        category: "Architectural",
        question: "Why is Layer Normalization preferred over Batch Normalization in Transformer models?",
        modelAnswer: "Batch Normalization computes statistics across the mini-batch for each feature channel. In NLP, sentences have variable sequence lengths, making batch statistics noisy and dependent on batch size and padding. Layer Normalization, however, computes the mean and variance across the hidden features for each individual token independently, making it invariant to batch size and natural for variable length sequences and distributed training.",
        examinerIntent: "Testing neural network normalization techniques and practical NLP constraints.",
        difficulty: "Tricky"
      },
      {
        id: "viva-tf-3",
        category: "Algorithmic Complexity",
        question: "What is the computational complexity of the self-attention layer, and how does KV-cache optimize generation?",
        modelAnswer: "Standard self-attention has a time and memory complexity of O(N^2 * d) where N is sequence length and d is hidden dimension, because every token interacts with every other token. During autoregressive token-by-token generation (inference), recomputing Keys and Values for all past tokens is redundant. KV-Caching stores previously computed Key and Value matrices in GPU memory, reducing generation of each new token from O(N^2) back to O(N) matrix-vector operations.",
        examinerIntent: "Testing awareness of inference bottlenecks and systems-level ML engineering.",
        difficulty: "Advanced"
      },
      {
        id: "viva-tf-4",
        category: "Comparison",
        question: "What is the fundamental difference between an Encoder-only model (like BERT) and a Decoder-only model (like GPT)?",
        modelAnswer: "An Encoder-only model uses bidirectional self-attention, meaning every token can attend to both previous and future tokens, making it ideal for classification and extraction tasks. A Decoder-only model enforces Causal (Autoregressive) Masking, where attention weights for all future tokens are set to -infinity, allowing tokens to only attend to past and current tokens, which is essential for next-token text generation.",
        examinerIntent: "Testing taxonomy of foundation models and attention masks.",
        difficulty: "Fundamental"
      }
    ],
    quickRevision: {
      elevatorPitch: "The Transformer is a deep learning architecture that eliminates recurrence by relying entirely on the Self-Attention mechanism to model relationships between all tokens in a sequence simultaneously. It projects token embeddings into Query, Key, and Value vectors, computes attention weights via scaled dot-products, and runs across multiple attention heads in parallel with positional encodings, enabling unprecedented GPU training scale.",
      mustKnowPoints: [
        "Attention formula: softmax((Q * K^T) / sqrt(d_k)) * V.",
        "Dividing by sqrt(d_k) prevents vanishing gradients caused by saturated softmax.",
        "Multi-Head attention splits vectors into subspaces to capture distinct semantic/syntactic roles.",
        "Positional Encodings are strictly required because attention is permutation-invariant.",
        "LayerNorm is used instead of BatchNorm because sequence lengths vary dynamically.",
        "Self-attention has quadratic O(N^2) complexity with sequence length N."
      ],
      examinerGotchas: [
        "Don't forget to mention Query, Key, and Value vectors are learned linear projections, not raw embeddings.",
        "Remember that GPT is Decoder-only (causal mask), BERT is Encoder-only (bidirectional), and T5 is Encoder-Decoder.",
        "If asked about modern long-context models, cite FlashAttention and RoPE (Rotary Position Embeddings)."
      ],
      keyTerms: [
        { term: "Self-Attention", def: "An attention mechanism relating different positions of a single sequence to compute a representation of the sequence." },
        { term: "Query, Key, Value", def: "Learned vector representations: Query represents the search token, Key represents the index token, Value is the content." },
        { term: "Causal Masking", def: "A lower-triangular mask that prevents autoregressive decoder models from looking ahead at future tokens." },
        { term: "KV Cache", def: "A memory optimization technique that stores Key and Value tensors of past tokens to speed up autoregressive inference." }
      ]
    }
  },

  "database-sharding": {
    id: "database-sharding",
    title: "Database Sharding & Distributed Indexing",
    category: "Database & Storage",
    tags: ["DBMS", "System Design", "Distributed Systems", "Storage Engines"],
    simpleExplanation: {
      eli5: "Imagine having a massive dictionary with 10 million words. If you put it in one giant physical book, it's so heavy that no one can lift it, and only one person can read it at a time. Sharding is like splitting the dictionary into 26 smaller volumes—Volume A, Volume B, Volume C. Now 26 people can read simultaneously, and each book fits comfortably on a shelf. But if you want to find words that rhyme across different letters, you now have to search multiple books at once.",
      coreProblem: "A single relational database server eventually hits hardware ceilings (CPU, RAM, disk I/O limits). Vertical scaling (buying bigger servers) becomes exponentially expensive and hits physical limits.",
      keyPillars: [
        { title: "Horizontal Partitioning (Sharding)", desc: "Splitting database rows across independent physical nodes based on a Shard Key." },
        { title: "Consistent Hashing & Routing", desc: "Mapping keys to shards such that adding or removing database nodes minimizes data rebalancing." },
        { title: "Distributed Joins & Cross-Shard Transactions", desc: "The cost of sharding: multi-shard queries require two-phase commit (2PC) or scatter-gather queries." }
      ],
      mentalModel: "Client Query -> Shard Router -> Hash(ShardKey) % Nodes -> Target Shard Node -> B+ Tree Local Index -> Result",
      examinerFocus: "Examiners will ask: 'What makes a good shard key?', 'What is the Celebrity / Hotspot problem?', and 'How do you perform joins across sharded databases?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: Scaling Databases Beyond Limits",
        slideBullets: [
          "Topic: Database Sharding & Distributed Indexing",
          "Presented by: [Your Name], 3rd Year Computer Engineering",
          "Core Theme: Architecting multi-terabyte transactional storage"
        ],
        script: "Good day professors and peers. When an application grows from thousands to hundreds of millions of users, single database instances inevitably choke on I/O throughput. Today, we explore Database Sharding—horizontal database partitioning—along with distributed indexing strategies, consistent hashing, and the engineering trade-offs required to scale relational systems.",
        timing: "60s",
        visualCue: "Set a clear engineering context: scaling beyond single-node hardware limits.",
        examinerTrap: "Trap question: 'Is Sharding the same as database replication?' Answer: 'No, replication copies the same data across multiple nodes for read scaling and fault tolerance; sharding partitions different subsets of data across nodes for write scaling.'"
      },
      {
        slideNumber: 2,
        title: "Vertical vs Horizontal Scaling: The Wall",
        slideBullets: [
          "Vertical Scaling (Scale-Up): Bigger CPU, more RAM, NVMe SSDs (Hits financial & hardware ceiling)",
          "Horizontal Scaling (Scale-Out): Distributing data across commodity server clusters",
          "Partitioning types: Vertical (by column/domain) vs Horizontal (by rows/sharding)"
        ],
        script: "Every database architect faces two scaling paths. Scaling Up means buying a server with 128 cores and 1TB of RAM. But this is bounded by hardware limits and creates a colossal single point of failure. Scaling Out—horizontal partitioning—divides database rows across multiple independent physical machines, each running its own database engine. This provides virtually limitless storage and write throughput, but introduces distributed complexity.",
        timing: "90s",
        visualCue: "Differentiate row-wise horizontal splitting from column-wise vertical splitting.",
        examinerTrap: "Question: 'What is vertical partitioning?' Answer: Splitting a wide table into smaller tables by columns (e.g., separating user profile metadata from user auth passwords)."
      },
      {
        slideNumber: 3,
        title: "Choosing the Shard Key & Partitioning Strategies",
        slideBullets: [
          "Range-Based Sharding: Partition by range (e.g., A-F, G-M) -> Prone to write hotspots",
          "Hash-Based Sharding: Hash(key) % N -> Even distribution, but expensive re-sharding",
          "Directory-Based Sharding: Lookup table maps keys to physical shards -> Flexible but router bottleneck"
        ],
        script: "The most critical architectural decision in sharding is selecting the Shard Key. In Range-Based sharding, we partition by value intervals—for example, timestamps or alphabetical order. However, if all new records use current timestamps, all writes slam into the single newest shard, creating a severe hotspot! In Hash-Based sharding, we apply a hash function to the key to distribute data uniformly. The trade-off is that range queries now require querying every single shard in the cluster.",
        timing: "95s",
        visualCue: "Emphasize the write hotspot problem on the timeline diagram.",
        examinerTrap: "Examiner question: 'What is the Celebrity / Hotspot problem in sharding?' Answer: When a single shard key (like Justin Bieber's user_id) generates millions of concurrent reads and writes on one shard."
      },
      {
        slideNumber: 4,
        title: "Consistent Hashing: Painless Re-Sharding",
        slideBullets: [
          "Naive Hash (Key % N): Adding node N+1 forces re-hashing almost 100% of existing keys",
          "Consistent Hashing Ring (0 to 2^32 - 1): Keys and nodes mapped onto a circular space",
          "Virtual Nodes (V-nodes): Balances load evenly across heterogeneous hardware"
        ],
        script: "What happens when you add a 5th database server to a 4-node cluster? With naive hashing `Key % N`, changing N from 4 to 5 causes almost all keys to map to different servers, triggering a catastrophic data migration storm. Consistent Hashing solves this by arranging the hash space into a virtual ring. When a new node is inserted into the ring, only keys between that node and its predecessor need to be moved—an average of just K/N keys! By using Virtual Nodes, we ensure perfectly uniform load distribution.",
        timing: "100s",
        visualCue: "Trace clockwise on the circular hash ring to show how keys map to the nearest physical node.",
        examinerTrap: "Question: 'Why are Virtual Nodes essential in consistent hashing?' Answer: Without virtual nodes, real-world hash distributions leave large empty segments on the ring, causing uneven hot spots."
      },
      {
        slideNumber: 5,
        title: "Distributed Indexing & Cross-Shard Joins",
        slideBullets: [
          "Local Secondary Indexes: Indexed per shard; requires Scatter-Gather queries",
          "Global Secondary Indexes: Dedicated index table partitioned differently; requires 2-Phase Commit",
          "Cross-Shard Joins: Extremely expensive; solved by De-normalization or Application-level joins"
        ],
        script: "Indexing in a sharded database presents a fundamental challenge. Primary key queries route cleanly to a single shard. But what if a query searches by email instead of user_id? With Local Secondary Indexes, the router must perform a Scatter-Gather query: broadcast the query to every shard and aggregate the results. Alternatively, a Global Secondary Index maps emails to shard IDs, but updating it during a write requires distributed two-phase commit (2PC) or asynchronous eventual consistency.",
        timing: "90s",
        visualCue: "Show the fan-out scatter-gather arrows from router to Shard 1, 2, and 3.",
        examinerTrap: "Question: 'Why are ACID transactions hard across sharded databases?' Answer: Because distributed transactions require Two-Phase Commit (2PC), which introduces coordinator blocking and high latency."
      },
      {
        slideNumber: 6,
        title: "Real-World Architecture & CAP Theorem",
        slideBullets: [
          "CAP Theorem trade-off: Consistency vs Availability during network partitions",
          "Examples in production: Spanner (TrueTime CP), Cassandra (AP), Vitess for MySQL",
          "Engineering rule: Never shard prematurely; optimize indexes and caching first!"
        ],
        script: "In the distributed world, the CAP Theorem dictates that under network partitions, a sharded database must choose between Consistency and Availability. Google Spanner achieves serializable consistency using atomic GPS hardware clocks (TrueTime), while Apache Cassandra prioritizes availability with tunable eventual consistency. The most important lesson for third-year engineers: Sharding adds immense operational complexity. Never shard until you have exhausted caching, read replicas, and indexing optimizations.",
        timing: "80s",
        visualCue: "Display the CAP triangle and highlight the operational complexity warning.",
        examinerTrap: "Question: 'What is Vitess?' Answer: An open-source database clustering system for horizontal scaling of MySQL, originally developed by YouTube."
      },
      {
        slideNumber: 7,
        title: "Conclusion & Review",
        slideBullets: [
          "Sharding delivers horizontal write scalability at the cost of operational and query complexity",
          "Consistent hashing and careful shard key design are foundational to success",
          "Thank you! Ready for viva questions."
        ],
        script: "To conclude, database sharding is the ultimate lever for horizontal data scalability. By combining intelligent shard key selection, consistent hashing, and disciplined secondary indexing, modern systems support petabyte-scale workloads. Thank you for your attention, and I am ready for your questions.",
        timing: "45s",
        visualCue: "Stand confidently and open the floor to the panel.",
        examinerTrap: "Ready for viva."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-shard-1",
        category: "Fundamental",
        question: "What is the difference between Database Replication and Database Sharding?",
        modelAnswer: "Replication copies the ENTIRE dataset across multiple servers. It primarily scales READ operations and provides high availability / fault tolerance if a primary node crashes. Sharding, on the other hand, PARTITIONS the dataset so that each server holds a distinct subset of rows. It primarily scales WRITE operations and overcomes single-node memory and disk capacity limits.",
        examinerIntent: "Testing core definitions and architecture distinction.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-shard-2",
        category: "System Design",
        question: "What is a 'Hotspot' in sharding, and how do you mitigate it?",
        modelAnswer: "A hotspot occurs when data access is severely unbalanced, causing one shard to receive disproportionate read or write traffic while others remain idle. Common causes include range sharding on monotonically increasing IDs (timestamp hotspots) or high-profile entities (celebrity problem). Mitigation strategies include using salt hashes (prepending a random hash prefix to the shard key), adopting consistent hashing with virtual nodes, or isolating extreme entities in dedicated cache tiers.",
        examinerIntent: "Testing production-readiness and practical scaling knowledge.",
        difficulty: "Tricky"
      },
      {
        id: "viva-shard-3",
        category: "Indexing",
        question: "What is a 'Scatter-Gather' query and why is it problematic at scale?",
        modelAnswer: "When a query filters on a non-shard key, the shard router cannot know which physical shard holds the matching rows. It must 'scatter' the query by sending it concurrently to ALL shards in the cluster, wait for responses, and 'gather' (sort and merge) the results. It is problematic at scale because a single slow shard degrades the entire query (tail latency problem), and cluster throughput degrades rapidly as node count increases.",
        examinerIntent: "Testing distributed query performance understanding.",
        difficulty: "Practical"
      },
      {
        id: "viva-shard-4",
        category: "Distributed Transactions",
        question: "Why do distributed transactions across multiple shards degrade performance?",
        modelAnswer: "Cross-shard transactions typically require the Two-Phase Commit (2PC) protocol to maintain ACID properties. 2PC introduces synchronous network round-trips (Prepare Phase and Commit Phase) across multiple servers. During this window, database row locks must be held across all participating shards, blocking concurrent transactions, increasing latency by orders of magnitude, and risking coordinator-failure deadlocks.",
        examinerIntent: "Testing distributed systems and database transaction coordination.",
        difficulty: "Advanced"
      }
    ],
    quickRevision: {
      elevatorPitch: "Database Sharding is a horizontal partitioning technique where a database's rows are divided across multiple independent physical server instances based on a designated shard key. It allows write-heavy applications to exceed the hardware limitations of a single machine by using consistent hashing for even key distribution, at the cost of making cross-shard joins and distributed transactions complex.",
      mustKnowPoints: [
        "Replication scales reads & adds fault tolerance; Sharding scales writes & total storage.",
        "Shard Key determines which physical machine holds a particular row.",
        "Naive hashing (Key % N) triggers massive re-sharding when nodes change; Consistent Hashing moves only K/N keys.",
        "Range-based sharding often creates write hotspots on the newest partition.",
        "Cross-shard joins are slow and require scatter-gather operations or de-normalization.",
        "Always optimize single-node indexes, caching (Redis), and read replicas before resorting to sharding."
      ],
      examinerGotchas: [
        "Don't say 'sharding makes all queries faster'—secondary index queries and joins become much slower!",
        "Be ready to explain how two-phase commit works across shards.",
        "Remember virtual nodes in consistent hashing solve non-uniform key distribution."
      ],
      keyTerms: [
        { term: "Shard Key", def: "One or more columns used to determine the target shard for a row of data." },
        { term: "Consistent Hashing", def: "A hashing scheme such that when a hash table is resized, only K/n keys need to be remapped on average." },
        { term: "Scatter-Gather", def: "A distributed query pattern where a request is broadcast to all shards and responses are aggregated." },
        { term: "Two-Phase Commit (2PC)", def: "An atomic commitment protocol used in distributed systems to ensure all shards commit or abort a transaction." }
      ]
    }
  },

  "tcp-vs-quic": {
    id: "tcp-vs-quic",
    title: "TCP vs QUIC (HTTP/3) Protocol Architecture",
    category: "Computer Networks",
    tags: ["Networks", "Protocols", "HTTP/3", "QUIC", "TCP/IP"],
    simpleExplanation: {
      eli5: "Imagine sending a shipment of 5 packages down a single-lane highway. In TCP, if package #2 falls off the truck, the entire highway halts for everyone until package #2 is found and resent. This is called 'Head-of-Line Blocking'. QUIC is like having 5 independent delivery drones flying over UDP. If drone #2 gets lost in the wind, drones 1, 3, 4, and 5 land safely and immediately hand their packages to the receiver without waiting.",
      coreProblem: "TCP was designed in the 1970s for wired networks with static IP addresses. In the modern mobile internet, TCP incurs heavy handshake latency (TCP + TLS takes 3 round-trips), breaks connections when phones switch from Wi-Fi to 5G, and suffers from Head-of-Line blocking over HTTP/2 multiplexed streams.",
      keyPillars: [
        { title: "0-RTT Connection Establishment", desc: "QUIC combines transport and cryptographic handshakes into a single round-trip (or 0-RTT on reconnects)." },
        { title: "Stream Multiplexing without Head-of-Line Blocking", desc: "Each stream in QUIC is tracked independently; dropping a packet in stream A does not stall stream B." },
        { title: "Connection ID & Mobile Roaming Migration", desc: "Identifies connections using a 64-bit Connection ID instead of the traditional 4-tuple (IP, port), allowing seamless Wi-Fi to cellular handover." }
      ],
      mentalModel: "HTTP/1.1 (TCP, 1 req/conn) -> HTTP/2 (TCP, multiplexed, HoL blocking) -> HTTP/3 (QUIC over UDP, zero HoL, 0-RTT)",
      examinerFocus: "Examiners will ask: 'Why does QUIC run over UDP instead of TCP or a brand new transport protocol?', 'What is 0-RTT replay attack?', and 'How does connection migration work?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: The Reinvention of Transport Protocols",
        slideBullets: [
          "Topic: TCP vs QUIC (HTTP/3) Protocol Evolution",
          "Presented by: [Your Name], 3rd Year Computer Engineering",
          "Core Theme: Overcoming 40 years of TCP ossification"
        ],
        script: "Respected examiners and peers. Every web request today travels across protocols designed during the Cold War. While our bandwidth increased 1,000-fold, latency is fundamentally limited by the speed of light. Today, we examine QUIC—the UDP-based transport protocol powering HTTP/3—and discover how it eliminates handshake latency, solves Head-of-Line blocking, and powers the modern real-time internet.",
        timing: "60s",
        visualCue: "Maintain eye contact; highlight that HTTP/3 runs on top of UDP, not TCP.",
        examinerTrap: "Trap: 'Does QUIC make UDP reliable?' Answer: 'Yes! UDP provides raw datagram delivery, while QUIC implements acknowledgments, congestion control, and packet loss recovery in user space.'"
      },
      {
        slideNumber: 2,
        title: "The Bottlenecks of Classical TCP + TLS",
        slideBullets: [
          "Handshake Latency: TCP 3-way handshake (SYN, SYN-ACK, ACK) + TLS 1.3 handshake = 2 to 3 RTTs",
          "Head-of-Line (HoL) Blocking: In HTTP/2, dropping one packet stalls all multiplexed streams",
          "Protocol Ossification: Middleboxes (firewalls, routers) block unknown transport protocols, cementing TCP and UDP"
        ],
        script: "Why did Google and the IETF invent QUIC? In classical web stacks, establishing a secure connection requires multiple round trips: one RTT for the TCP three-way handshake, and another RTT for TLS encryption negotiation. On mobile networks with 100ms latency, the user waits 300ms before a single byte of HTML is requested. Even worse, HTTP/2 multiplexed hundreds of streams over one TCP pipe—so if one TCP packet dropped, the entire pipeline froze until retransmission occurred.",
        timing: "90s",
        visualCue: "Illustrate the multi-RTT timeline comparison side by side.",
        examinerTrap: "Question: 'What is protocol ossification?' Answer: Middleboxes on the internet only recognize TCP and UDP; any new transport protocol at IP layer 4 gets dropped by intermediate routers."
      },
      {
        slideNumber: 3,
        title: "Enter QUIC: Architecture over UDP",
        slideBullets: [
          "Built on top of UDP in User Space for rapid deployment and updates",
          "Built-in TLS 1.3 encryption: No plaintext headers visible to intermediate snoopers",
          "Independent byte streams: Packet loss on stream 1 does not affect stream 2"
        ],
        script: "Because operating system kernels update slowly and middleboxes block new protocols, QUIC was built on top of UDP. By encapsulating transport logic in user space, QUIC can be updated with application code without requiring kernel updates. Unlike TCP where transport headers are plaintext, QUIC encrypts virtually all packet headers using TLS 1.3, preventing ISP snooping and middlebox tampering. Most importantly, each data stream inside QUIC is completely independent.",
        timing: "90s",
        visualCue: "Show protocol stack: App -> HTTP/3 -> QUIC -> UDP -> IP vs App -> HTTP/2 -> TLS -> TCP -> IP.",
        examinerTrap: "Question: 'Doesn't user space networking increase CPU overhead?' Answer: Yes, QUIC has historically consumed more CPU due to frequent UDP system calls, though optimizations like UDP GSO (Generic Segmentation Offload) mitigate this."
      },
      {
        slideNumber: 4,
        title: "0-RTT Handshake & Connection Migration",
        slideBullets: [
          "Combined Handshake: Transport parameters and TLS 1.3 cryptographic keys negotiated together (1 RTT)",
          "0-RTT Resumption: Returning clients transmit encrypted application data on the very first packet",
          "Connection ID: 64-bit identifier decouples connection from IP address",
          "Seamless Roaming: Switching from Wi-Fi to 5G maintains active downloads without reconnecting"
        ],
        script: "One of QUIC's crowning achievements is connection establishment speed. A new connection takes just 1 RTT. Returning clients can achieve 0-RTT: the client sends encrypted GET requests in the very first packet! Furthermore, TCP binds connections to a 4-tuple of Source IP, Source Port, Dest IP, Dest Port. If you walk out of your house and your phone switches from Wi-Fi to 5G, your IP changes and your TCP connection dies. QUIC uses an immutable 64-bit Connection ID, allowing seamless connection migration without breaking active video streams or downloads.",
        timing: "95s",
        visualCue: "Act out the mobile walking scenario: Wi-Fi disconnects -> IP changes -> Connection ID stays same -> stream continues.",
        examinerTrap: "Question: 'What is the security risk of 0-RTT?' Answer: 'Replay attacks! An attacker can record and replay 0-RTT packets, so non-idempotent operations like POST /pay must never use 0-RTT.'"
      },
      {
        slideNumber: 5,
        title: "Congestion Control & Forward Error Correction",
        slideBullets: [
          "Monotonically increasing Packet Numbers: Eliminates TCP Retransmission Ambiguity",
          "Pluggable Congestion Control: BBRv2, CUBIC implemented in user space",
          "Precise RTT measurement: Timestamping inside packet headers improves pacing"
        ],
        script: "In TCP, when a packet is retransmitted with the same sequence number, the sender cannot tell whether an incoming ACK was for the original transmission or the retransmission. This is the Retransmission Ambiguity problem. QUIC solves this elegantly: every packet sent receives a strictly increasing, unique packet number, even if it is a retransmission. This enables ultra-precise Round-Trip Time measurements and rapid congestion control adjustments using algorithms like BBR.",
        timing: "85s",
        visualCue: "Explain sequence numbers vs packet numbers on the whiteboard or slide.",
        examinerTrap: "Question: 'Does QUIC use sequence numbers or packet numbers?' Answer: 'QUIC uses Packet Numbers for transport acknowledgment, and separate Stream Offsets for application data assembly.'"
      },
      {
        slideNumber: 6,
        title: "Industrial Adoption & Benchmarks",
        slideBullets: [
          "Standardized as RFC 9000 by IETF in 2021",
          "Used by Google (YouTube, Search), Cloudflare, Meta (Instagram), and Uber",
          "Results: 8% faster search latency, 15% reduction in video buffering on mobile networks"
        ],
        script: "QUIC is no longer theoretical. In 2021, the IETF ratified RFC 9000. Today, over 30% of global internet traffic runs on QUIC and HTTP/3. Google reported an 8% improvement in search latency and a 15% drop in YouTube video buffering on unstable mobile connections. Major CDNs like Cloudflare and Fastly enable HTTP/3 by default.",
        timing: "75s",
        visualCue: "Reference real-world metrics and RFC 9000 standardization.",
        examinerTrap: "Question: 'What is the fallback mechanism if a corporate firewall blocks UDP port 443?' Answer: 'Browsers race UDP/QUIC and TCP/TLS; if UDP is blocked, they seamlessly fall back to HTTP/2 over TCP using the Alt-Svc header.'"
      },
      {
        slideNumber: 7,
        title: "Conclusion & Technical Viva",
        slideBullets: [
          "QUIC overcomes TCP's structural limits via UDP + User-space TLS 1.3",
          "Key benefits: Zero Head-of-Line blocking, 0-RTT, and Connection Migration",
          "Floor open for questions"
        ],
        script: "To conclude, QUIC represents the most consequential modernization of internet transport protocols in four decades. By decoupling streams, uniting security with transport handshakes, and surviving IP network handovers, QUIC ensures the internet keeps pace with mobile reality. Thank you, and I look forward to your questions.",
        timing: "45s",
        visualCue: "Maintain poise and invite questions from the panel.",
        examinerTrap: "Ready for viva."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-quic-1",
        category: "Fundamental",
        question: "Why does QUIC run over UDP instead of creating a new IP transport protocol like SCTP?",
        modelAnswer: "Because of 'protocol ossification' in internet middleboxes (firewalls, NAT routers, load balancers). Most intermediate network hardware only recognizes TCP and UDP at Layer 4; packets with any other IP protocol number are discarded as unknown or suspicious. Running QUIC over UDP allows it to traverse existing internet middleboxes without requiring worldwide hardware upgrades, while still implementing reliability in user space.",
        examinerIntent: "Testing awareness of internet infrastructure and middlebox constraints.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-quic-2",
        category: "Security",
        question: "What is a 0-RTT Replay Attack in QUIC / TLS 1.3 and how is it mitigated?",
        modelAnswer: "In 0-RTT, the client sends encrypted early data in its initial packet using previous session keys. An eavesdropping attacker can record that packet and replay it to the server multiple times. While the attacker cannot decrypt it, they can cause duplicate actions (e.g., executing a bank transfer twice). It is mitigated by strictly disallowing 0-RTT for non-idempotent HTTP methods (like POST/PUT) and using server-side single-use tickets with timestamps.",
        examinerIntent: "Testing security vulnerabilities in cryptographic protocols.",
        difficulty: "Advanced"
      },
      {
        id: "viva-quic-3",
        category: "Transport Mechanics",
        question: "How does QUIC solve the TCP Retransmission Ambiguity problem?",
        modelAnswer: "In TCP, when a retransmitted segment is sent, it carries the same sequence number as the original segment. When an ACK arrives, the sender cannot tell if it acknowledged the first or second transmission, leading to inaccurate RTT calculations. QUIC solves this by giving every transmitted packet a strictly monotonically increasing Packet Number. If packet 5 is lost, its retransmitted payload is sent as packet 12. ACKs explicitly reference packet numbers, removing ambiguity.",
        examinerIntent: "Testing deep transport protocol mechanics and ACK architectures.",
        difficulty: "Tricky"
      },
      {
        id: "viva-quic-4",
        category: "Networking & OS",
        question: "How does QUIC allow connection migration when a device switches from Wi-Fi to Mobile Data?",
        modelAnswer: "TCP identifies a connection by a 4-tuple: (Source IP, Source Port, Dest IP, Dest Port). Switching networks changes the device's IP, which breaks the TCP connection. QUIC instead identifies a connection using an explicit 64-bit Connection ID negotiated at handshake. Even when the device's IP and port change, packets continue to carry the same Connection ID, allowing the server to seamlessly route the packets to the existing session without restarting handshakes.",
        examinerIntent: "Testing socket fundamentals and mobile network handover mechanics.",
        difficulty: "Practical"
      }
    ],
    quickRevision: {
      elevatorPitch: "QUIC is a modern transport layer protocol developed by Google and standardized as RFC 9000, powering HTTP/3. Operating over UDP in user space with integrated TLS 1.3 encryption, QUIC achieves 0-to-1 RTT connection establishment, eliminates Head-of-Line blocking across multiplexed streams, and maintains connections during IP address changes via 64-bit Connection IDs.",
      mustKnowPoints: [
        "QUIC = HTTP/3 transport layer; runs over UDP.",
        "Combines transport + TLS 1.3 handshake into 1-RTT (or 0-RTT on resumption).",
        "Solves Head-of-Line blocking: packet drops only affect that specific stream.",
        "Uses Connection IDs rather than IP:Port tuples for smooth Wi-Fi to cellular roaming.",
        "Eliminates TCP Retransmission Ambiguity with strictly increasing packet numbers.",
        "Fallback mechanism uses Alt-Svc header to downgrade to HTTP/2 if UDP 443 is blocked."
      ],
      examinerGotchas: [
        "Never say UDP makes QUIC unreliable; QUIC implements reliability on top of UDP.",
        "Remember that 0-RTT is vulnerable to replay attacks and must only be used for idempotent GET requests.",
        "Know the RFC number: RFC 9000."
      ],
      keyTerms: [
        { term: "Head-of-Line Blocking", def: "A performance bottleneck where a single dropped packet delays processing of all subsequent packets in the queue." },
        { term: "0-RTT Resumption", def: "A feature allowing a returning client to transmit application data alongside the initial connection handshake." },
        { term: "Connection ID", def: "A unique identifier assigned to a QUIC connection that persists across client IP and port changes." },
        { term: "Alt-Svc", def: "An HTTP response header used by servers to inform clients that the service is also available over another protocol/port (e.g. h3)." }
      ]
    }
  },

  "pipelining-hazards": {
    id: "pipelining-hazards",
    title: "Instruction Pipelining & Branch Hazard Resolution",
    category: "Computer Architecture",
    tags: ["Computer Architecture", "Processors", "Pipelining", "RISC", "Hardware"],
    simpleExplanation: {
      eli5: "Imagine doing your laundry. If you wash, dry, iron, and fold one load of clothes completely before starting the second load, 4 loads take 16 hours. In a laundry pipeline, as soon as load #1 moves from the washer to the dryer, load #2 immediately goes into the washer! That's instruction pipelining. But a 'hazard' happens when load #2 needs the red shirt currently inside load #1 (Data Hazard), or you realize halfway through that load #3 belongs to your neighbor and shouldn't be washed at all (Branch Hazard).",
      coreProblem: "A classical single-cycle CPU must wait for an entire instruction (Fetch, Decode, Execute, Memory, Writeback) to finish before starting the next, wasting hardware execution units and lowering processor clock speed.",
      keyPillars: [
        { title: "The 5-Stage Classic RISC Pipeline", desc: "Instruction Fetch (IF), Instruction Decode (ID), Execute (EX), Memory Access (MEM), and Writeback (WB)." },
        { title: "The Three Pipeline Hazards", desc: "Structural Hazards (hardware conflicts), Data Hazards (read-after-write dependencies), and Control Hazards (branching)." },
        { title: "Hazard Mitigation Strategies", desc: "Operand Forwarding/Bypassing, Pipeline Stalling (Bubbles), Dynamic Branch Prediction (2-bit saturating counters, Branch Target Buffers)." }
      ],
      mentalModel: "IF -> ID -> EX -> MEM -> WB (Throughput approaches 1 instruction per cycle; latency per instruction is 5 cycles)",
      examinerFocus: "Examiners will ask: 'What is the formula for pipeline speedup?', 'Explain RAW, WAR, and WAW hazards', and 'How does a 2-bit branch predictor work?'"
    },
    slides: [
      {
        slideNumber: 1,
        title: "Title & Hook: Unleashing Processor Throughput",
        slideBullets: [
          "Topic: Instruction Pipelining & Hazard Resolution",
          "Architecture: Classic 5-Stage RISC Pipeline (MIPS/RISC-V)",
          "Presented by: [Your Name], 3rd Year Computer Engineering"
        ],
        script: "Respected professors and colleagues. In computer architecture, the central pursuit is maximizing Instructions Per Cycle (IPC). Rather than waiting for one instruction to execute sequentially from memory to register file, modern processors overlap instruction execution like an assembly line. Today, we investigate the classic 5-stage RISC pipeline, analyze the three fatal hazards that stall execution, and explore hardware bypassing and branch prediction mechanisms.",
        timing: "60s",
        visualCue: "Set a rigorous microarchitectural tone; refer to RISC-V or MIPS as the concrete reference architecture.",
        examinerTrap: "Trap question: 'Does pipelining decrease the latency of an individual instruction?' Answer: 'No! Pipelining increases throughput (instructions completed per unit time), but slightly increases latency of individual instructions due to pipeline register overhead.'"
      },
      {
        slideNumber: 2,
        title: "The 5-Stage RISC Pipeline Mechanics",
        slideBullets: [
          "Stage 1: IF (Instruction Fetch from Instruction Cache via PC)",
          "Stage 2: ID / RF (Instruction Decode & Register File Read)",
          "Stage 3: EX (ALU Execution / Effective Address Calculation)",
          "Stage 4: MEM (Data Memory Read/Write)",
          "Stage 5: WB (Writeback result to Register File)"
        ],
        script: "Consider the classic 5-stage pipeline. In Stage 1, IF, the Instruction Register fetches the machine code from memory. In Stage 2, ID, opcode bits are decoded and operand registers are read. In Stage 3, EX, the Arithmetic Logic Unit computes results or memory offsets. In Stage 4, MEM, data is loaded or stored in cache. In Stage 5, WB, values are written back to the register file. In steady state, all 5 stages operate concurrently on 5 consecutive instructions, achieving an ideal throughput of 1 instruction per clock cycle.",
        timing: "90s",
        visualCue: "Point horizontally across the 5 pipeline stages and vertically down clock cycles 1 to 5.",
        examinerTrap: "Examiner question: 'What is the theoretical speedup of an N-stage pipeline over an unpipelined CPU?' Answer: 'Theoretical speedup is N, bounded by pipeline register latch delays and the slowest pipeline stage.'"
      },
      {
        slideNumber: 3,
        title: "Classification of Pipeline Hazards",
        slideBullets: [
          "Structural Hazards: Two instructions attempt to access the same hardware unit simultaneously",
          "Data Hazards: An instruction depends on the result of an earlier in-flight instruction (RAW, WAR, WAW)",
          "Control (Branch) Hazards: The next PC is unknown until branch condition is evaluated in EX or MEM"
        ],
        script: "In an ideal world, the pipeline never pauses. In reality, hazards force the CPU to insert stalls, or bubbles, degrading performance. We classify hazards into three categories. Structural hazards occur when hardware resources conflict—for instance, if memory has only one port and IF and MEM try to access it at the same cycle. Data hazards occur when instructions share registers before results are written. Control hazards occur when conditional branches alter program counter flow before the target address is evaluated.",
        timing: "90s",
        visualCue: "Display the 3 hazard icons: Hardware conflict, Register data dependency, Branch uncertainty.",
        examinerTrap: "Question: 'How do modern processors eliminate structural hazards in memory?' Answer: 'By using Harvard Architecture—separate Instruction Cache (I-Cache) and Data Cache (D-Cache).'"
      },
      {
        slideNumber: 4,
        title: "Data Hazards & Operand Forwarding",
        slideBullets: [
          "RAW (Read-After-Write) true dependency: `ADD R1, R2, R3` followed by `SUB R4, R1, R5`",
          "Naive solution: Stall pipeline for 2 clock cycles (Bubble)",
          "Hardware Solution: Data Forwarding / Bypassing from EX/MEM and MEM/WB registers directly to ALU inputs",
          "Load-Use Hazard: Cannot be solved by forwarding alone; requires 1 unavoidable bubble"
        ],
        script: "Let us examine a Read-After-Write data hazard. If an ADD instruction writes its result into register R1, that value is not officially committed until Stage 5 (Writeback). If the immediate next SUB instruction needs R1 in Stage 2 (Decode), it reads stale data! Naively, the CPU must stall for two cycles. But look closely: the ALU computes the correct value at the end of Stage 3! Hardware Forwarding routes this computed result directly from the pipeline register back into the ALU input multiplexer, eliminating stalls. The only exception is the Load-Use hazard, where data comes from memory, necessitating one mandatory stall cycle.",
        timing: "100s",
        visualCue: "Trace the forwarding wire from EX/MEM pipeline latch back to the ALU multiplexer.",
        examinerTrap: "Question: 'Why can't operand forwarding eliminate the stall in a Load-Use data hazard?' Answer: 'Because data from a LOAD instruction is only available at the end of MEM stage (Cycle 4), but the next instruction needs it at the start of EX stage (Cycle 3)—you cannot forward backwards in time!'"
      },
      {
        slideNumber: 5,
        title: "Control Hazards & Dynamic Branch Prediction",
        slideBullets: [
          "Branch Penalty: Conditional branch outcome determined in EX stage -> 2 lost cycles",
          "Static Prediction: Always taken vs Always not taken (Compiler profiling)",
          "Dynamic Prediction: 2-Bit Saturating Counter (Strongly Taken, Weakly Taken, Weakly Not Taken, Strongly Not Taken)",
          "Branch Target Buffer (BTB): Cache storing target PC addresses for zero-bubble fetching"
        ],
        script: "Control hazards are the most disruptive in modern deep pipelines. In code like `if (x == 0)`, the CPU does not know whether to jump or continue until Stage 3 evaluates the branch condition. If we simply wait, every branch costs 2 to 3 wasted cycles. Modern CPUs implement Dynamic Branch Prediction using 2-Bit Saturating Counters. By requiring two consecutive mispredictions to flip states, tight loops like `for (i=0; i<1000; i++)` only mispredict once at the very end! Coupled with a Branch Target Buffer (BTB), the CPU fetches the branch target with zero stall penalty.",
        timing: "100s",
        visualCue: "Draw the 4-state diagram of the 2-bit counter: 11 (Strong Taken) <-> 10 (Weak Taken) <-> 01 (Weak Not Taken) <-> 00 (Strong Not Taken).",
        examinerTrap: "Question: 'What is pipeline flush on branch misprediction?' Answer: 'If the prediction is wrong, all speculative instructions currently in IF and ID must be purged and replaced with NOPs, incurring a penalty equal to pipeline depth.'"
      },
      {
        slideNumber: 6,
        title: "Deep Pipelines & Superscalar Processors",
        slideBullets: [
          "Intel Pentium 4 NetBurst: 31 pipeline stages -> extreme misprediction penalty (20+ cycles)",
          "Modern sweet spot: 12 to 16 stages (AMD Zen, Apple M-series, Intel Core)",
          "Superscalar & Out-of-Order Execution (Tomasulo's Algorithm, Register Renaming)"
        ],
        script: "Why don't we build a 100-stage pipeline to make clock frequency skyrocket? In the 2000s, Intel attempted this with the Pentium 4's 31-stage pipeline. The result was severe: whenever a branch mispredicted, flushing 31 stages destroyed all efficiency! Modern high-performance chips balance depth at 12 to 16 stages and employ Out-of-Order execution using Tomasulo's algorithm and register renaming to bypass WAR and WAW false hazards.",
        timing: "85s",
        visualCue: "Illustrate the curve of pipeline depth vs overall IPC efficiency.",
        examinerTrap: "Question: 'What are WAR and WAW hazards, and can they happen in the classic in-order 5-stage pipeline?' Answer: 'Write-After-Read and Write-After-Write are anti-dependencies. They CANNOT occur in an in-order 5-stage pipeline because instructions always writeback in order; they only occur in Out-of-Order pipelines!'"
      },
      {
        slideNumber: 7,
        title: "Conclusion & Viva Voce",
        slideBullets: [
          "Pipelining overlaps execution to approach ideal CPI of 1",
          "Mitigated by Forwarding, Branch Prediction, and Harvard Caches",
          "Ready for technical examination"
        ],
        script: "In conclusion, instruction pipelining is the fundamental microarchitectural technique that transformed computing speed. By pairing overlapping pipeline stages with hardware forwarding and dynamic branch predictors, computer architects turn theoretical hazards into manageable engineering challenges. Thank you, and I look forward to answering your questions.",
        timing: "45s",
        visualCue: "Maintain strong posture, make direct eye contact, and welcome questions.",
        examinerTrap: "Ready for viva."
      }
    ],
    vivaQuestions: [
      {
        id: "viva-pipe-1",
        category: "Fundamental",
        question: "Explain the formula for theoretical speedup of an instruction pipeline, and why real speedup is always lower.",
        modelAnswer: "Theoretical speedup S = (k * n) / (k + n - 1), where k is the number of pipeline stages and n is the number of instructions. As n approaches infinity, speedup approaches k. Real speedup is always strictly lower because: 1) Stages are not perfectly balanced in execution time (clock cycle is bounded by the slowest stage), 2) Pipeline register latch delays add overhead, and 3) Pipeline hazards (data dependencies, branch mispredictions, cache misses) introduce stalls and flushes.",
        examinerIntent: "Testing microarchitectural speedup mathematical derivation.",
        difficulty: "Fundamental"
      },
      {
        id: "viva-pipe-2",
        category: "Microarchitecture",
        question: "Can Write-After-Read (WAR) and Write-After-Write (WAW) hazards occur in a classic in-order 5-stage RISC pipeline?",
        modelAnswer: "No, they cannot. In the classic 5-stage in-order pipeline, all instructions read registers strictly in Stage 2 (Decode) and write registers strictly in Stage 5 (Writeback). Since instructions proceed through the pipeline in strict program order, instruction i+1 can never write to a register before instruction i reads it (preventing WAR), nor can instruction i+1 write before instruction i writes (preventing WAW). WAR and WAW are false dependencies that only arise in Out-of-Order superscalar execution.",
        examinerIntent: "Discerning deep pipeline knowledge from rote hazard definitions.",
        difficulty: "Tricky"
      },
      {
        id: "viva-pipe-3",
        category: "Hardware Design",
        question: "How does a 2-bit Saturating Branch Predictor avoid thrashing compared to a 1-bit predictor?",
        modelAnswer: "A 1-bit branch predictor flips its prediction immediately after a single misprediction. In a nested loop that executes 100 times, a 1-bit predictor mispredicts twice: once when exiting the loop, and again on the very first iteration of the next run. A 2-bit saturating counter has four states: 00 (Strongly Not Taken), 01 (Weakly Not Taken), 10 (Weakly Taken), and 11 (Strongly Taken). It requires two consecutive mispredictions to flip the decision from taken to not-taken. Thus, an anomalous exit in a loop only moves the state from 11 to 10 without changing the prediction for the next run.",
        examinerIntent: "Testing finite state machine design for processor branch predictors.",
        difficulty: "Advanced"
      },
      {
        id: "viva-pipe-4",
        category: "Compiler & System",
        question: "What is a 'Branch Delay Slot' and how does the compiler utilize it in MIPS architectures?",
        modelAnswer: "In early pipelined architectures like MIPS, the instruction immediately following a branch instruction (in the branch delay slot) is always executed, regardless of whether the branch is taken or not taken, while the branch target is being fetched. The optimizing compiler analyzes the control flow and moves an independent useful instruction into this delay slot so cycles are not wasted. If no safe instruction is found, the compiler inserts a NOP.",
        examinerIntent: "Testing compiler-architecture co-design and architectural history.",
        difficulty: "Practical"
      }
    ],
    quickRevision: {
      elevatorPitch: "Instruction pipelining is a CPU implementation technique where multiple instructions are overlapped in execution across specialized hardware stages (IF, ID, EX, MEM, WB). While it maximizes instruction throughput toward 1 CPI, execution is threatened by Structural, Data (RAW), and Control (Branch) hazards, which are mitigated in hardware using Harvard cache architectures, operand forwarding busses, and 2-bit dynamic branch predictors.",
      mustKnowPoints: [
        "Classic 5 stages: Instruction Fetch, Decode, Execute, Memory, Writeback.",
        "Pipelining increases throughput (IPC), NOT individual instruction latency.",
        "Structural Hazard = hardware conflict (solved by separate I-Cache and D-Cache).",
        "Data Hazard = RAW true dependency (solved by Operand Forwarding).",
        "Load-Use hazard requires 1 unavoidable stall cycle even with forwarding.",
        "Branch Hazard = control flow uncertainty (solved by 2-bit saturating counters & BTB)."
      ],
      examinerGotchas: [
        "Never say forwarding eliminates ALL data stalls—Load-Use hazard still requires 1 stall cycle!",
        "Remember WAR and WAW do NOT occur in an in-order pipeline.",
        "Be ready to sketch the 4-state diagram of a 2-bit saturating counter."
      ],
      keyTerms: [
        { term: "Instructions Per Cycle (IPC)", def: "The average number of instructions executed for each clock cycle of a processor." },
        { term: "Operand Forwarding", def: "A hardware optimization that routes an ALU output directly from a pipeline register to an ALU input multiplexer." },
        { term: "Branch Target Buffer (BTB)", def: "A hardware cache on the CPU that stores predicted target addresses for branch instructions." },
        { term: "Load-Use Hazard", def: "A data hazard where an instruction immediately depends on data being loaded from memory by the preceding instruction." }
      ]
    }
  }
};


/**
 * Domain taxonomy and intelligent generative engine for ANY Computer Engineering topic.
 * Analyzes the user's input topic, classifies into a Computer Engineering branch,
 * extracts technical concepts, and synthesizes slide speaking points, viva traps, analogies, and cheatsheets.
 */
class CETopicSynthesizer {
  constructor() {
    this.domains = [
      {
        name: "Distributed Systems & Cloud Computing",
        keywords: ["distributed", "raft", "paxos", "consensus", "cloud", "kubernetes", "k8s", "microservices", "cap", "kafka", "grpc", "actor", "zookeeper", "etcd", "serverless", "aws", "docker", "container", "load balancer"],
        analogyTheme: "a worldwide logistics fleet of trucks coordinating without a single central depot",
        coreProblemTheme: "unreliable networks, node crashes, split-brain partitions, and synchronization latency",
        examinerQuestions: [
          "How does this system tolerate network partitions according to the CAP theorem?",
          "What happens if the primary coordinator crashes halfway through an operation?",
          "How is data consistency guaranteed across concurrent requests?",
          "Why is an asynchronous model preferred over synchronous blocking calls here?"
        ]
      },
      {
        name: "Operating Systems & Systems Programming",
        keywords: ["os", "kernel", "process", "thread", "concurrency", "deadlock", "mutex", "semaphore", "paging", "virtual memory", "tlb", "epoll", "system call", "scheduling", "cache", "linux", "cgroup", "file system"],
        analogyTheme: "a busy airport traffic control tower managing runways, gates, and emergency diversions",
        coreProblemTheme: "finite hardware resource contention, race conditions, memory leaks, and context-switching overhead",
        examinerQuestions: [
          "What is the exact distinction between user space and kernel space in this mechanism?",
          "How does this avoid race conditions and deadlocks under heavy multi-threaded load?",
          "What system calls are invoked under the hood in the Linux kernel?",
          "What is the CPU and memory overhead compared to naive polling or synchronous blocking?"
        ]
      },
      {
        name: "Computer Networks & Security",
        keywords: ["network", "tcp", "udp", "http", "quic", "dns", "socket", "tls", "ssl", "crypto", "rsa", "firewall", "router", "bgp", "packet", "handshake", "ddos", "vulnerability", "auth", "jwt", "oauth", "zero trust"],
        analogyTheme: "an international diplomatic postal service with encrypted wax seals and certified couriers",
        coreProblemTheme: "packet loss, untrusted intermediate hops, man-in-the-middle interception, and round-trip latency",
        examinerQuestions: [
          "How many network round-trips (RTT) are required before data transmission begins?",
          "What security vulnerabilities or attack vectors (e.g., replay attack, spoofing) must be mitigated?",
          "How does this protocol detect and recover from dropped or out-of-order packets?",
          "What are the header overheads and bandwidth implications at scale?"
        ]
      },
      {
        name: "Database Systems & Storage Engines",
        keywords: ["database", "dbms", "sql", "nosql", "sharding", "index", "b+", "lsm", "acid", "transaction", "wal", "redis", "mongodb", "postgres", "replication", "query", "normalization", "cache", "vector db"],
        analogyTheme: "a massive metropolitan public library with catalog cards, archive vaults, and instant borrow slips",
        coreProblemTheme: "disk I/O bottlenecks, lock contention, write amplification, and data corruption during power loss",
        examinerQuestions: [
          "How does this architecture handle concurrent ACID transactions without catastrophic lock contention?",
          "What is the difference in read vs write performance characteristics (e.g., B+ Trees vs LSM Trees)?",
          "How is crash recovery implemented using Write-Ahead Logging (WAL) or snapshotting?",
          "What are the indexing trade-offs regarding storage footprint and write amplification?"
        ]
      },
      {
        name: "Artificial Intelligence & Data Engineering",
        keywords: ["ai", "ml", "machine learning", "deep learning", "transformer", "neural", "cnn", "rnn", "llm", "gradient", "attention", "backprop", "nlp", "vision", "embeddings", "overfitting", "loss", "training", "inference"],
        analogyTheme: "a master apprentice learning to recognize artistic painting styles by studying thousands of masterworks",
        coreProblemTheme: "vanishing gradients, high computational training costs, overfitting to training data, and inference latency",
        examinerQuestions: [
          "What is the mathematical justification for the loss function or optimization step used here?",
          "How does this architecture overcome the vanishing or exploding gradient problem during backpropagation?",
          "What is the computational complexity during training versus real-time inference?",
          "How do you prevent overfitting and ensure out-of-distribution generalization?"
        ]
      },
      {
        name: "Software Engineering & Architecture",
        keywords: ["architecture", "software", "design pattern", "api", "rest", "graphql", "clean code", "solid", "refactoring", "ci/cd", "testing", "mvc", "monolith", "event-driven", "cqrs", "domain"],
        analogyTheme: "modular skyscraper construction where floors and electrical wiring can be upgraded without demolishing the building",
        coreProblemTheme: "tight coupling, spaghetti dependencies, unmaintainable legacy codebases, and deployment friction",
        examinerQuestions: [
          "How does this architectural approach enforce separation of concerns and loose coupling?",
          "What are the trade-offs of this pattern compared to the traditional monolithic or MVC approach?",
          "How do you handle schema evolution, backward compatibility, and integration testing?",
          "Where are the performance bottlenecks likely to emerge as request traffic scales 100x?"
        ]
      }
    ];
  }

  detectDomain(topic) {
    const lower = topic.toLowerCase();
    let bestDomain = this.domains[0];
    let maxMatches = -1;

    for (const domain of this.domains) {
      let count = 0;
      for (const kw of domain.keywords) {
        if (lower.includes(kw)) count += 2;
      }
      if (count > maxMatches) {
        maxMatches = count;
        bestDomain = domain;
      }
    }
    return bestDomain;
  }

  synthesizeTopic(topicTitle) {
    // Check if we have pre-engineered topic
    const normalized = topicTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
    for (const key in CE_TOPICS_DATABASE) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return CE_TOPICS_DATABASE[key];
      }
    }

    // Dynamic generation
    const cleanTitle = topicTitle.trim();
    const domain = this.detectDomain(cleanTitle);

    return {
      id: `custom-${Date.now()}`,
      title: cleanTitle,
      category: domain.name,
      tags: [domain.name, "3rd Year CE", "Seminar", "Technical Presentation"],
      simpleExplanation: {
        eli5: `Think of ${cleanTitle} like ${domain.analogyTheme}. In computer engineering, instead of doing things the traditional brute-force way which gets slow and chaotic, ${cleanTitle} sets up structured rules and checkpoints so that independent parts work together seamlessly without stepping on each other's toes.`,
        coreProblem: `In engineering systems, ${cleanTitle} was introduced to tackle ${domain.coreProblemTheme}. Without it, systems suffer from unpredictable latency, poor scalability, and frequent runtime failures under real-world loads.`,
        keyPillars: [
          { title: "Core Mechanism & Abstraction", desc: `How ${cleanTitle} encapsulates low-level complexity into an efficient, modular interface for higher-level applications.` },
          { title: "State & Resource Management", desc: `How memory, CPU cycles, network packets, or persistent state are tracked, synchronized, and safeguarded against race conditions.` },
          { title: "Fault Tolerance & Guarantees", desc: `The mathematical or architectural guarantees provided when nodes, connections, or processes fail midway.` }
        ],
        mentalModel: `Input Request -> Validation & Scheduling -> ${cleanTitle} Core Processing Engine -> State Transition / Execution -> Verified Output`,
        examinerFocus: `University examiners evaluating 3rd-year seminars on ${cleanTitle} will specifically focus on trade-offs, internal mechanics rather than surface definitions, and failure modes.`
      },
      slides: [
        {
          slideNumber: 1,
          title: `Title & Hook: Understanding ${cleanTitle}`,
          slideBullets: [
            `Topic: ${cleanTitle}`,
            `Presented by: [Your Name], 3rd Year B.Tech Computer Engineering`,
            `Domain: ${domain.name}`,
            `Goal: Architectural breakdown, mechanics, and practical trade-offs`
          ],
          script: `Respected teachers, external examiners, and my dear classmates. Today, I am presenting on ${cleanTitle}, a pivotal topic in ${domain.name}. In modern computing, handling ${domain.coreProblemTheme} is one of the toughest engineering challenges. Over the next few minutes, I will walk you through the fundamental motivation, internal architecture, practical advantages, and real-world trade-offs of this technology.`,
          timing: "60s",
          visualCue: "Stand with open posture, smile, greet the examination panel, and establish confident voice projection.",
          examinerTrap: `Examiners will ask: 'Why did you choose this seminar topic, and what real-world problem does ${cleanTitle} solve?' Answer with immediate business/system impact.`
        },
        {
          slideNumber: 2,
          title: `The Problem Statement: Why Do We Need ${cleanTitle}?`,
          slideBullets: [
            `Legacy approaches and their performance bottlenecks`,
            `The critical challenge of ${domain.coreProblemTheme}`,
            `Why naive solutions fail at production scale`,
            `The engineering requirement for a standardized, robust approach`
          ],
          script: `To truly appreciate ${cleanTitle}, we must examine the failure of legacy approaches. When systems relied on naive implementations, they frequently suffered from bottlenecks, concurrency issues, and excessive operational overhead. As user demand and data scale exploded, these traditional approaches reached their breaking point. ${cleanTitle} was created specifically to solve these fundamental bottlenecks by introducing a resilient architectural paradigm.`,
          timing: "90s",
          visualCue: "Point to the comparison on the slide between the legacy limitation and the new approach.",
          examinerTrap: "Trap question: 'What was the exact historical limitation that triggered the invention of this technique?' Be prepared to cite the older alternative it replaced."
        },
        {
          slideNumber: 3,
          title: `Core Architectural Principles of ${cleanTitle}`,
          slideBullets: [
            `High-level system topology and key structural components`,
            `Decoupling of responsibilities and separation of concerns`,
            `Data flow pipeline from initial input to final execution`,
            `Crucial invariants and state preservation`
          ],
          script: `Let us now inspect the core architecture of ${cleanTitle}. As illustrated in this diagram, the system is structured into distinct, modular components. Rather than having a monolithic pipeline, responsibilities are cleanly decoupled. When an incoming request arrives, it travels through validation, gets processed via optimized internal data structures, and updates the underlying state while preserving consistency invariants across the board.`,
          timing: "90s",
          visualCue: "Use your laser pointer or hand to trace the flow arrow from the client side through the processing engine to the storage tier.",
          examinerTrap: "Examiners will ask: 'Which component is the single point of failure (SPOF) in this diagram?' Be ready to identify it and explain how redundancy mitigates it."
        },
        {
          slideNumber: 4,
          title: `Algorithmic Mechanics & Step-by-Step Workflow`,
          slideBullets: [
            `Step-by-step execution lifecycle`,
            `Underlying mathematical or algorithmic logic`,
            `Data structure choices and time/space complexity`,
            `How race conditions and edge cases are handled`
          ],
          script: `Moving into the algorithmic mechanics: what actually happens under the hood during execution? When triggered, the algorithm executes in discrete phases. First, it establishes necessary preconditions and acquires necessary locks or tokens. Second, it executes the core state transformation. By utilizing optimized data structures, time complexity is kept tightly bounded. Edge cases, such as abrupt disconnections or invalid payloads, are trapped and handled cleanly without crashing the host process.`,
          timing: "100s",
          visualCue: "Count out the execution steps on your fingers: Step 1 Precondition, Step 2 Processing, Step 3 Verification.",
          examinerTrap: "Examiners love asking: 'What is the best-case vs worst-case time complexity, and what triggers the worst-case scenario?'"
        },
        {
          slideNumber: 5,
          title: `Performance, Trade-offs & Limitations`,
          slideBullets: [
            `Key advantages: Throughput, modularity, and resource efficiency`,
            `The engineering trade-offs: Latency overhead, memory footprint, complexity`,
            `When NOT to use ${cleanTitle}`,
            `Comparison with industry alternatives`
          ],
          script: `In computer engineering, there are no solutions—only trade-offs. While ${cleanTitle} delivers tremendous gains in scalability, fault tolerance, and modularity, it is not a silver bullet. It introduces additional cognitive and architectural complexity, requires specialized monitoring, and can add slight latency overhead on lightweight workloads. As engineers, we must know when NOT to use it: for small, single-node applications, simpler alternatives are often superior.`,
          timing: "90s",
          visualCue: "Nod when discussing limitations; examiners respect students who understand system drawbacks rather than blindly praising a technology.",
          examinerTrap: "Trap question: 'In what scenario would you explicitly advise AGAINST using this technology?' Give a concrete, realistic constraint."
        },
        {
          slideNumber: 6,
          title: `Real-World Case Studies & Industry Adoption`,
          slideBullets: [
            `How top tech companies implement ${cleanTitle} at scale`,
            `Benchmarks, throughput numbers, and production metrics`,
            `Integration with existing developer ecosystems and toolchains`,
            `Modern evolution and future trends`
          ],
          script: `To see this in action, let us review real-world industry adoption. Leading engineering organizations implement ${cleanTitle} to power mission-critical services handling millions of operations daily. Benchmarks demonstrate significant reductions in tail latency and hardware utilization. Looking forward, emerging patterns continue to refine this technology with automated orchestration and intelligent optimizations.`,
          timing: "80s",
          visualCue: "Display the benchmark graph and reference production metrics.",
          examinerTrap: "Examiners may ask: 'Can you name two widely used open-source libraries or tools that implement this in practice?'"
        },
        {
          slideNumber: 7,
          title: `Conclusion & Summary`,
          slideBullets: [
            `Key takeaways: Solving ${domain.coreProblemTheme} via principled design`,
            `Fundamental importance in 3rd-year Computer Engineering curriculum`,
            `Thank you for your time and guidance`,
            `Questions & Discussion`
          ],
          script: `To wrap up: ${cleanTitle} represents a foundational milestone in ${domain.name}. By establishing rigorous architectural boundaries and addressing ${domain.coreProblemTheme}, it provides the resilience modern software systems demand. Thank you very much for your time, faculty members and peers. I am now delighted to answer your questions.`,
          timing: "45s",
          visualCue: "Smile, stand tall, make direct eye contact with the examiners, and pause attentively for the first question.",
          examinerTrap: "Ready for viva. Keep your voice steady and acknowledge questions respectfully."
        }
      ],
      vivaQuestions: [
        {
          id: `viva-${Date.now()}-1`,
          category: "Fundamental Concept",
          question: `What is the core working principle of ${cleanTitle}, and what primary problem was it designed to solve?`,
          modelAnswer: `${cleanTitle} was engineered to address ${domain.coreProblemTheme}. Its primary working principle revolves around encapsulating complex operations into structured, verifiable stages, ensuring reliable execution and preventing data corruption or performance degradation.`,
          examinerIntent: "Testing whether the student understands the foundational purpose rather than just memorized jargon.",
          difficulty: "Fundamental"
        },
        {
          id: `viva-${Date.now()}-2`,
          category: "Edge Case & Traps",
          question: `What happens when ${cleanTitle} encounters a sudden node crash, network partition, or out-of-memory condition during execution?`,
          modelAnswer: `Under critical failures, a well-architected implementation of ${cleanTitle} relies on crash-recovery mechanisms—such as write-ahead logs, idempotent retry tokens, or heartbeat-based timeouts—to prevent partial writes. Either the operation rolls back gracefully to the last verified checkpoint, or a standby instance takes over without violating system invariants.`,
          examinerIntent: "Testing fault tolerance awareness and failure handling.",
          difficulty: "Tricky"
        },
        {
          id: `viva-${Date.now()}-3`,
          category: "Trade-offs & Comparison",
          question: domain.examinerQuestions[0],
          modelAnswer: `Under the CAP theorem or distributed constraints, trade-offs must be explicitly chosen. In partition scenarios, systems either prioritize consistency by rejecting conflicting updates until quorum is restored, or prioritize availability by accepting localized writes and resolving divergent states asynchronously via vector clocks or last-write-wins rules.`,
          examinerIntent: "Testing architectural decision-making and theoretical rigor.",
          difficulty: "Advanced"
        },
        {
          id: `viva-${Date.now()}-4`,
          category: "System Design & Scale",
          question: domain.examinerQuestions[1],
          modelAnswer: `If the primary coordinator crashes midway, the system avoids corruption by ensuring operations are executed within atomic two-phase boundaries or distributed consensus logs. Standby nodes elect a new coordinator through lease expiration, inspect the state of in-flight transactions, and cleanly decide whether to abort or commit based on whether a majority quorum was acknowledged.`,
          examinerIntent: "Testing understanding of distributed coordination and crash recovery.",
          difficulty: "Practical"
        }
      ],
      quickRevision: {
        elevatorPitch: `${cleanTitle} is a critical architectural concept in ${domain.name} that resolves ${domain.coreProblemTheme}. It structures system interactions through modular decoupled layers and deterministic state management, ensuring high throughput, robust fault tolerance, and predictable resource utilization under demanding production workloads.`,
        mustKnowPoints: [
          `Belongs to the domain of ${domain.name}.`,
          `Designed specifically to overcome ${domain.coreProblemTheme}.`,
          `Key trade-off: Increased architectural complexity in exchange for superior scalability and resilience.`,
          `Relies on clear separation of concerns between state management and operational logic.`,
          `Failure handling: Utilizes timeouts, heartbeats, or atomic rollback boundaries to guarantee data safety.`
        ],
        examinerGotchas: [
          `Don't give a generic textbook definition—anchor your answer in practical computer engineering trade-offs.`,
          `Be ready to name the underlying algorithms and data structures used.`,
          `Always highlight how the system behaves when hardware or network faults occur.`
        ],
        keyTerms: [
          { term: "Invariance", def: "A condition that must always remain true throughout the execution of a program or protocol." },
          { term: "Fault Tolerance", def: "The capability of a system to continue operating properly in the event of hardware or software failure." },
          { term: "Idempotency", def: "A property where performing an operation multiple times produces the exact same outcome as a single execution." },
          { term: "Scalability", def: "The measure of a system's ability to increase capacity and performance when hardware resources are added." }
        ]
      }
    };
  }
}

// Export for application consumption
if (typeof window !== "undefined") {
  window.CE_TOPICS_DATABASE = CE_TOPICS_DATABASE;
  window.CETopicSynthesizer = CETopicSynthesizer;
}
