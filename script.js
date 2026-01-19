const bookNames = {
    bible: 'Bible',
    quran: 'Quran',
    torah: 'Torah'
};

const state = {
    selectedBook: null,
    isCompareMode: false,
    compareBooks: new Set(['bible', 'quran', 'torah']),
    conversations: {
        bible: [],
        quran: [],
        torah: []
    }
};

// DOM elements
const selectionScreen = document.getElementById('selection-screen');
const chatScreen = document.getElementById('chat-screen');
const bookOptions = document.querySelectorAll('.book-option');
const backButton = document.getElementById('back-button');
const selectedBookTitle = document.getElementById('selected-book-title');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const compareToggle = document.getElementById('compare-toggle');
const compareStart = document.getElementById('compare-start');
const compareControls = document.getElementById('compare-controls');
const compareCheckboxes = document.querySelectorAll('.pill-checkbox input');
const modeBadge = document.getElementById('mode-badge');
const aboutOpen = document.getElementById('about-open');
const aboutClose = document.getElementById('about-close');
const aboutModal = document.getElementById('about-modal');
const quickChips = document.querySelectorAll('.chip');
const rotatingBook = document.getElementById('rotating-book');
const exampleText = document.getElementById('example-text');

const rotatingBooks = ['Bible', 'Quran', 'Torah'];
const exampleQuestions = [
    'What does the Quran say about Iran’s regime and protestors?',
    'How would the Bible evaluate Donald Trump’s leadership?',
    'What does the Torah say about power and accountability?',
    'How should faith guide views on Elon Musk’s influence?',
    'Do the scriptures permit overthrowing oppressive rulers?',
    'What do the sacred texts say about truth in politics?'
];
let bookIndex = 0;
let exampleIndex = 0;
let charIndex = 0;
let typingForward = true;
let bookCharIndex = 0;
let bookTypingForward = true;
let rotationTimer = null;

// Initialize event listeners
bookOptions.forEach(option => {
    option.addEventListener('click', () => {
        compareToggle.checked = false;
        compareStart.disabled = true;
        state.isCompareMode = false;
        state.selectedBook = option.dataset.book;
        showChatScreen();
    });
});

compareToggle.addEventListener('change', () => {
    compareStart.disabled = !compareToggle.checked;
});

compareStart.addEventListener('click', () => {
    if (!compareToggle.checked) return;
    state.isCompareMode = true;
    state.selectedBook = null;
    showChatScreen();
});

compareCheckboxes.forEach(input => {
    input.addEventListener('change', () => {
        if (input.checked) {
            state.compareBooks.add(input.value);
        } else {
            state.compareBooks.delete(input.value);
        }
    });
});

backButton.addEventListener('click', () => {
    showSelectionScreen();
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

aboutOpen.addEventListener('click', () => {
    aboutModal.classList.remove('hidden');
});

aboutClose.addEventListener('click', () => {
    aboutModal.classList.add('hidden');
});

aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.add('hidden');
    }
});

quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
        messageInput.value = chip.dataset.question || '';
        if (!chatScreen.classList.contains('active')) {
            showChatScreen();
        }
        messageInput.focus();
    });
});

function isSelectionScreenActive() {
    return selectionScreen.classList.contains('active');
}

function typeBookTitle() {
    if (!rotatingBook || !isSelectionScreenActive()) return;
    const current = rotatingBooks[bookIndex];
    if (bookTypingForward) {
        bookCharIndex += 1;
        rotatingBook.textContent = current.slice(0, bookCharIndex);
        if (bookCharIndex >= current.length) {
            bookTypingForward = false;
            return;
        }
    } else {
        bookCharIndex -= 1;
        rotatingBook.textContent = current.slice(0, bookCharIndex);
        if (bookCharIndex <= 0) {
            bookTypingForward = true;
            bookIndex = (bookIndex + 1) % rotatingBooks.length;
        }
    }
}

function typeExamples() {
    if (!exampleText || !isSelectionScreenActive()) return;

    const current = exampleQuestions[exampleIndex];
    if (typingForward) {
        charIndex += 1;
        exampleText.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
            typingForward = false;
            return;
        }
    } else {
        charIndex -= 1;
        exampleText.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
            typingForward = true;
            exampleIndex = (exampleIndex + 1) % exampleQuestions.length;
        }
    }
}

function startHeroAnimations() {
    if (rotationTimer) return;
    rotationTimer = setInterval(() => {
        typeBookTitle();
        typeExamples();
    }, 140);
}

function stopHeroAnimations() {
    if (rotationTimer) {
        clearInterval(rotationTimer);
        rotationTimer = null;
    }
}

// Screen navigation
function showChatScreen() {
    selectionScreen.classList.remove('active');
    chatScreen.classList.add('active');
    chatMessages.innerHTML = '';
    resetConversations();
    stopHeroAnimations();

    if (state.isCompareMode) {
        selectedBookTitle.textContent = 'Compare Answers';
        modeBadge.textContent = 'Compare';
        compareControls.classList.remove('hidden');
        addAssistantMessage('Ask a question and I will answer from each selected book.');
    } else {
        selectedBookTitle.textContent = `Ask the ${bookNames[state.selectedBook]}`;
        modeBadge.textContent = 'Single';
        compareControls.classList.add('hidden');
        addAssistantMessage(`Welcome! Ask me anything and I’ll answer from the ${bookNames[state.selectedBook]} with references and interpretation.`);
    }

    messageInput.focus();
}

function showSelectionScreen() {
    chatScreen.classList.remove('active');
    selectionScreen.classList.add('active');
    state.selectedBook = null;
    state.isCompareMode = false;
    compareControls.classList.add('hidden');
    chatMessages.innerHTML = '';
    startHeroAnimations();
}

// Message rendering
function addUserMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAssistantMessage(content, references = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.appendChild(formatText(content));
    messageDiv.appendChild(contentDiv);

    if (references && references.length > 0) {
        messageDiv.appendChild(createReferences(references));
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createCompareGroup(books) {
    const group = document.createElement('div');
    group.className = 'compare-group';

    const columns = document.createElement('div');
    columns.className = 'compare-columns';

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'compare-card';
        card.dataset.book = book;

        const header = document.createElement('div');
        header.className = 'compare-card-header';
        header.textContent = bookNames[book];
        card.appendChild(header);

        const content = document.createElement('div');
        content.className = 'compare-card-content';
        content.innerHTML = '<span class="loading"></span> Thinking...';
        card.appendChild(content);

        columns.appendChild(card);
    });

    group.appendChild(columns);
    chatMessages.appendChild(group);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return group;
}

function updateCompareCard(group, book, content, references = null) {
    const card = group.querySelector(`.compare-card[data-book="${book}"]`);
    if (!card) return;
    const contentDiv = card.querySelector('.compare-card-content');
    contentDiv.innerHTML = '';
    contentDiv.appendChild(formatText(content));
    if (references && references.length > 0) {
        card.appendChild(createReferences(references));
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(text) {
    const safe = escapeHtml(text);
    return safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function formatText(content) {
    const fragment = document.createDocumentFragment();
    const lines = content.split(/\n+/).map(line => line.trim()).filter(Boolean);

    if (lines.length === 0) {
        const p = document.createElement('p');
        p.innerHTML = renderInlineMarkdown(content);
        fragment.appendChild(p);
        return fragment;
    }

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const orderedMatch = line.match(/^\d+\.\s+/);
        const unorderedMatch = line.match(/^[-*]\s+/);

        if (orderedMatch) {
            const ol = document.createElement('ol');
            while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                const li = document.createElement('li');
                li.innerHTML = renderInlineMarkdown(lines[i].replace(/^\d+\.\s+/, ''));
                ol.appendChild(li);
                i += 1;
            }
            fragment.appendChild(ol);
            continue;
        }

        if (unorderedMatch) {
            const ul = document.createElement('ul');
            while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
                const li = document.createElement('li');
                li.innerHTML = renderInlineMarkdown(lines[i].replace(/^[-*]\s+/, ''));
                ul.appendChild(li);
                i += 1;
            }
            fragment.appendChild(ul);
            continue;
        }

        const p = document.createElement('p');
        p.innerHTML = renderInlineMarkdown(line);
        fragment.appendChild(p);
        i += 1;
    }

    return fragment;
}

function createReferences(references) {
    const referencesDiv = document.createElement('div');
    referencesDiv.className = 'references';
    const title = document.createElement('div');
    title.className = 'references-title';
    title.textContent = 'References';
    referencesDiv.appendChild(title);

    references.forEach(ref => {
        const refItem = document.createElement('div');
        refItem.className = 'reference-item';
        refItem.textContent = ref;
        referencesDiv.appendChild(refItem);
    });

    return referencesDiv;
}

function resetConversations() {
    Object.keys(state.conversations).forEach(key => {
        state.conversations[key] = [];
    });
}

function getConversationHistory(book) {
    return state.conversations[book] || [];
}

// API
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    if (!state.isCompareMode && !state.selectedBook) return;
    const booksToAsk = state.isCompareMode ? Array.from(state.compareBooks) : [state.selectedBook];
    if (state.isCompareMode && booksToAsk.length === 0) {
        alert('Select at least one book to compare.');
        return;
    }

    addUserMessage(message);
    messageInput.value = '';
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="loading"></span>';

    const apiBaseUrl = window.location.protocol === 'file:'
        ? 'http://localhost:3000'
        : window.location.origin;

    try {
        if (!state.isCompareMode) {
            const data = await fetchAnswer(apiBaseUrl, state.selectedBook, message);
            addAssistantMessage(data.response, data.references);
        } else {
            const group = createCompareGroup(booksToAsk);
            await Promise.all(booksToAsk.map(async book => {
                const data = await fetchAnswer(apiBaseUrl, book, message);
                updateCompareCard(group, book, data.response, data.references);
            }));
        }
    } catch (error) {
        console.error('Error:', error);
        if (!state.isCompareMode) {
            const fallback = getFallbackResponse(message, state.selectedBook);
            addAssistantMessage(fallback.response, fallback.references);
        } else {
            const group = createCompareGroup(booksToAsk);
            booksToAsk.forEach(book => {
                const fallback = getFallbackResponse(message, book);
                updateCompareCard(group, book, fallback.response, fallback.references);
            });
        }
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        messageInput.focus();
    }
}

async function fetchAnswer(apiBaseUrl, book, message) {
    state.conversations[book].push({ role: 'user', content: message });

    const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            book,
            message,
            conversationHistory: getConversationHistory(book)
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get response');
    }

        const data = await response.json();
        if (!data.response || !data.response.trim()) {
            throw new Error('Empty response from server');
        }
        state.conversations[book].push({ role: 'assistant', content: data.response });
        return data;
}

// Fallback response for development (when API is not available)
function getFallbackResponse(message, book) {
    const bookName = bookNames[book];
    const responses = {
        bible: {
            default: `Thank you for your question about the ${bookName}. The ${bookName} addresses many important themes.`,
            references: ['John 3:16', 'Matthew 5:3-12', '1 Corinthians 13:4-7']
        },
        quran: {
            default: `Thank you for your question about the ${bookName}. The ${bookName} contains profound guidance.`,
            references: ['Al-Fatiha 1:1-7', 'Al-Baqarah 2:255', 'Ar-Rahman 55:1-78']
        },
        torah: {
            default: `Thank you for your question about the ${bookName}. The ${bookName} is foundational to faith and law.`,
            references: ['Genesis 1:1', 'Exodus 20:1-17', 'Deuteronomy 6:4-9']
        }
    };

    const bookResponse = responses[book] || responses.bible;
    return {
        response: `${bookResponse.default}\n\nHere is a general interpretation based on the text.`,
        references: bookResponse.references
    };
}

// Start hero animations on initial load
startHeroAnimations();
