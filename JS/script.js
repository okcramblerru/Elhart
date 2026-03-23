    (function() {
        // Получаем все элементы навигации (пункты меню)
        const navItems = document.querySelectorAll('.nav-item');
        // Объект с ссылками на элементы дропдаунов по их id
        const dropdowns = {
            item1: document.getElementById('dropdown-item1'),
            item2: document.getElementById('dropdown-item2'),
            item3: document.getElementById('dropdown-item3'),
            item4: document.getElementById('dropdown-item4'),
            item5: document.getElementById('dropdown-item5'),
            item6: document.getElementById('dropdown-item6'),
            item7: document.getElementById('dropdown-item7'),
            item8: document.getElementById('dropdown-item8'),

        };

        let activeDropdown = null;   // Переменная для хранения текущего открытого дропдауна
        let closeTimeout = null;     // Таймер для отложенного закрытия

        // Функция закрытия всех дропдаунов (с возможностью мгновенного закрытия)
        function closeAllDropdowns(immediate = false) {
            // Если есть запланированный таймер закрытия, очищаем его
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            if (immediate) {
                // Мгновенно: убираем класс active у всех дропдаунов
                Object.values(dropdowns).forEach(drop => {
                    if (drop) drop.classList.remove('active');
                });
                activeDropdown = null;
                // Скрываем все подменю
                document.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
            } else {
                // С задержкой
                closeTimeout = setTimeout(() => {
                    Object.values(dropdowns).forEach(drop => {
                        if (drop) drop.classList.remove('active');
                    });
                    activeDropdown = null;
                    document.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
                    closeTimeout = null;
                }, 250); // 250 мс задержка для предотвращения случайного закрытия
            }
        }

        // Отмена запланированного закрытия
        function cancelClose() {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        }

        // Показать конкретный дропдаун по его ключу (mac, ipad...)
        function showDropdown(dropdownId) {
            cancelClose(); // Отменяем закрытие, если оно было запланировано
            const targetDropdown = dropdowns[dropdownId];
            if (!targetDropdown) return;

            // Если этот же дропдаун уже активен, ничего не делаем
            if (activeDropdown === targetDropdown) return;

            // Закрываем все остальные дропдауны
            Object.values(dropdowns).forEach(drop => {
                if (drop && drop !== targetDropdown) drop.classList.remove('active');
            });

            // Открываем нужный
            targetDropdown.classList.add('active');
            activeDropdown = targetDropdown;
        }

        // Навешиваем обработчики на пункты меню: при наведении показываем соответствующий дропдаун
        navItems.forEach(item => {
            const dropdownKey = item.getAttribute('data-dropdown');
            if (!dropdownKey) return;

            item.addEventListener('mouseenter', () => {
                showDropdown(dropdownKey);
            });
            // Нет обработчика mouseleave — меню НЕ закрывается при уходе с ссылки
        });

        // Обработчики для контейнеров дропдаунов: при входе отменяем закрытие, при выходе — запускаем закрытие с задержкой
        Object.values(dropdowns).forEach(dropdown => {
            if (!dropdown) return;

            dropdown.addEventListener('mouseenter', () => {
                cancelClose(); // Если мышь зашла в дропдаун, отменяем закрытие
            });

            dropdown.addEventListener('mouseleave', () => {
                closeAllDropdowns(false); // Ушла — закроем через задержку
            });
        });

        // ========== Логика подменю (чтобы не исчезало) ==========
        // Находим все элементы, у которых есть подменю
        const submenuTriggers = document.querySelectorAll('.has-submenu');

        submenuTriggers.forEach(trigger => {
            const submenu = trigger.querySelector('.submenu');
            if (!submenu) return;

            let submenuCloseTimer = null; // Таймер для закрытия подменю

            // Функция отмены закрытия подменю
            function cancelSubmenuClose() {
                if (submenuCloseTimer) {
                    clearTimeout(submenuCloseTimer);
                    submenuCloseTimer = null;
                }
            }

            // Функция закрытия подменю (с задержкой или мгновенно)
            function closeSubmenu(delayed = true) {
                cancelSubmenuClose();
                if (delayed) {
                    submenuCloseTimer = setTimeout(() => {
                        // Проверяем, где сейчас находится курсор (используем document.elementFromPoint)
                        // Для этого нужно знать координаты курсора. В момент вызова мы их не имеем,
                        // поэтому будем использовать последнее событие. Для простоты определим по событию mouseleave.
                        // Однако в этом обработчике мы будем вызывать closeSubmenu только из mouseleave,
                        // где координаты доступны. Для единообразия будем передавать их.
                        // В нашей реализации мы не будем использовать elementFromPoint, так как у нас уже есть
                        // отдельная логика в mouseleave, которая передаёт координаты. Но для безопасности
                        // оставим старую проверку. Однако, чтобы подменю точно не исчезало,
                        // мы уже управляем через mouseleave с задержкой и проверкой.
                        // Поэтому здесь просто закрываем, но проверка будет в самом обработчике.
                        // (Ниже обработчики используют координаты и проверку)
                        submenu.classList.remove('active');
                        submenuCloseTimer = null;
                    }, 80);
                } else {
                    submenu.classList.remove('active');
                }
            }

            // При наведении на триггер (пункт с подменю) показываем подменю
            trigger.addEventListener('mouseenter', () => {
                cancelSubmenuClose();
                // Скрываем другие подменю в этом же дропдауне для аккуратности
                const parentDropdown = trigger.closest('.dropdown-menu');
                if (parentDropdown) {
                    parentDropdown.querySelectorAll('.submenu').forEach(otherSub => {
                        if (otherSub !== submenu) otherSub.classList.remove('active');
                    });
                }
                submenu.classList.add('active');
            });

            // При уходе мыши с триггера запускаем таймер и проверяем, не ушёл ли курсор на подменю
            trigger.addEventListener('mouseleave', (event) => {
                const leaveX = event.clientX;   // Координаты курсора в момент ухода
                const leaveY = event.clientY;
                cancelSubmenuClose();
                submenuCloseTimer = setTimeout(() => {
                    // Проверяем, какой элемент находится под курсором в этих координатах
                    const elemUnderCursor = document.elementFromPoint(leaveX, leaveY);
                    if (elemUnderCursor && (trigger.contains(elemUnderCursor) || submenu.contains(elemUnderCursor))) {
                        // Если курсор всё ещё над триггером или подменю — не закрываем
                        return;
                    }
                    submenu.classList.remove('active');
                    submenuCloseTimer = null;
                }, 50);
            });

            // При наведении на само подменю отменяем закрытие
            submenu.addEventListener('mouseenter', () => {
                cancelSubmenuClose();
            });

            // При уходе с подменю аналогично проверяем, не вернулся ли курсор на триггер
            submenu.addEventListener('mouseleave', (event) => {
                const leaveX = event.clientX;
                const leaveY = event.clientY;
                cancelSubmenuClose();
                submenuCloseTimer = setTimeout(() => {
                    const elemUnderCursor = document.elementFromPoint(leaveX, leaveY);
                    if (elemUnderCursor && (trigger.contains(elemUnderCursor) || submenu.contains(elemUnderCursor))) {
                        return;
                    }
                    submenu.classList.remove('active');
                    submenuCloseTimer = null;
                }, 50);
            });
        });

        // Закрытие меню при клике вне навигации и дропдауна
        document.addEventListener('click', (e) => {
            const isInsideNav = e.target.closest('.global-nav');
            const isInsideDropdown = e.target.closest('.dropdown-menu');
            if (!isInsideNav && !isInsideDropdown) {
                closeAllDropdowns(true); // Мгновенно закрываем всё
            }
        });

        // Переопределяем closeAllDropdowns, чтобы она также закрывала все подменю (хотя уже закрывает)
        const originalCloseAll = closeAllDropdowns;
        window.closeAllDropdowns = function(immediate) {
            originalCloseAll(immediate);
            document.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('active'));
        };
    })();