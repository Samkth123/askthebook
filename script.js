const bookNames = {
    bible: 'Bible',
    quran: "Qur'an",
    torah: 'Torah'
};

const state = {
    selectedBook: null,
    isCompareMode: false,
    compareBooks: new Set(['quran', 'bible', 'torah']),
    conversations: {
        bible: [],
        quran: [],
        torah: []
    }
};

const selectionScreen = document.getElementById('selection-screen');
const chatScreen = document.getElementById('chat-screen');

if (selectionScreen && chatScreen) {
    const backButton = document.getElementById('back-button');
    const selectedBookTitle = document.getElementById('chat-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const compareControls = document.getElementById('compare-controls');
    const compareCheckboxes = document.querySelectorAll('.pill-checkbox input');
    const modeBadge = document.getElementById('mode-badge');
    const homeAskForm = document.getElementById('home-ask-form');
    const homeQuestionInput = document.getElementById('home-question-input');
    const sourceInputs = document.querySelectorAll('.source-input[name="source"]');
    const quickChips = document.querySelectorAll('.chip[data-question]');
    const aboutOpen = document.getElementById('about-open');
    const aboutClose = document.getElementById('about-close');
    const aboutModal = document.getElementById('about-modal');

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

    compareCheckboxes.forEach(input => {
        input.addEventListener('change', () => {
            if (input.checked) {
                state.compareBooks.add(input.value);
            } else {
                state.compareBooks.delete(input.value);
            }
        });
    });

    quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (!homeQuestionInput) return;
            homeQuestionInput.value = chip.dataset.question || '';
            homeQuestionInput.focus();
        });
    });

    if (homeAskForm) {
        homeAskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedSource = Array.from(sourceInputs).find(input => input.checked);
            if (!selectedSource) {
                alert('Please select a source to start.');
                return;
            }

            state.compareBooks = new Set([selectedSource.value]);
            state.isCompareMode = false;
            state.selectedBook = selectedSource.value;

            const message = homeQuestionInput.value.trim();
            showChatScreen();

            if (message) {
                messageInput.value = message;
                homeQuestionInput.value = '';
                sendMessage();
            } else {
                messageInput.focus();
            }
        });
    }

    if (aboutOpen && aboutClose && aboutModal) {
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
    }

    function showChatScreen() {
        selectionScreen.classList.remove('active');
        chatScreen.classList.add('active');
        chatMessages.innerHTML = '';
        resetConversations();

        if (state.isCompareMode) {
            selectedBookTitle.textContent = 'Compare Answers';
            modeBadge.textContent = 'Compare';
            compareControls.classList.remove('hidden');
            syncCompareCheckboxes();
            addAssistantMessage('Ask a question and I will answer from each selected source with citations and context.');
        } else {
            selectedBookTitle.textContent = `Ask the ${bookNames[state.selectedBook]}`;
            modeBadge.textContent = 'Single';
            compareControls.classList.add('hidden');
            addAssistantMessage(`Welcome. Ask anything and I will answer from the ${bookNames[state.selectedBook]} with references and context.`);
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
    }

    function syncCompareCheckboxes() {
        compareCheckboxes.forEach(input => {
            input.checked = state.compareBooks.has(input.value);
        });
    }

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

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        if (!state.isCompareMode && !state.selectedBook) return;
        const booksToAsk = state.isCompareMode ? Array.from(state.compareBooks) : [state.selectedBook];
        if (state.isCompareMode && booksToAsk.length === 0) {
            alert('Select at least one source to compare.');
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
}
