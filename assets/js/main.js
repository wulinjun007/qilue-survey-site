/* 重庆奇略测绘官网 · 交互
   依赖：config.js（window.SITE_CONFIG）*/
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};

  /* ---------- 统一配置渲染（FR-004） ---------- */
  document.querySelectorAll('[data-config="phone"]').forEach(function (el) {
    var p = CFG.phone || {};
    if (!p.value) { el.textContent = '电话待企业确认后公开'; return; }
    el.textContent = p.value;
    var parent = el.closest('[data-phone-wrap]');
    if (parent && p.verified === false) {
      var chip = document.createElement('span');
      chip.className = 'chip chip--warn';
      chip.textContent = '待核验';
      parent.appendChild(chip);
    }
  });
  document.querySelectorAll('a[data-config="telHref"]').forEach(function (a) {
    var p = CFG.phone || {};
    if (p.value) a.setAttribute('href', 'tel:' + String(p.value).replace(/\s/g, ''));
  });
  document.querySelectorAll('[data-config="address"]').forEach(function (el) {
    el.textContent = CFG.address ? CFG.address.value : '';
  });
  document.querySelectorAll('[data-config="addressLabel"]').forEach(function (el) {
    el.textContent = CFG.address ? CFG.address.label : '';
  });

  /* ---------- 复制电话（FR-004：失败后备为手动选择） ---------- */
  var copyBtn = document.querySelector('[data-copy-phone]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var num = (CFG.phone || {}).value || '';
      var done = function () {
        copyBtn.textContent = '已复制';
        setTimeout(function () { copyBtn.textContent = '复制号码'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(done).catch(function () { showFallback(); });
      } else { showFallback(); }
      function showFallback() {
        var fb = document.querySelector('[data-copy-fallback]');
        if (fb) fb.classList.remove('is-hidden');
      }
    });
  }

  /* ---------- 导航：滚动描边 + 移动端菜单 ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('navMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.classList.contains('nav__link')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- FAQ 手风琴 ---------- */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var expanded = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!expanded));
      var panel = document.getElementById(q.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-hidden', expanded);
    });
  });

  /* ---------- 表单（FR-005 校验 / demo 模式标识 §7.4） ---------- */
  var form = document.getElementById('consultForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var demoNote = document.getElementById('formDemoNote');
    var submitBtn = document.getElementById('formSubmit');

    // 服务预选（§7.1：服务详情入口带入，可更改）
    var params = new URLSearchParams(location.search);
    var pre = params.get('service');
    if (pre) {
      var radio = form.querySelector('input[name="service"][value="' + pre + '"]');
      if (radio) { radio.checked = true; radio.closest('.radio-card').classList.add('is-checked'); }
    }
    form.querySelectorAll('.radio-card input').forEach(function (r) {
      r.addEventListener('change', function () {
        form.querySelectorAll('.radio-card').forEach(function (c) { c.classList.remove('is-checked'); });
        r.closest('.radio-card').classList.add('is-checked');
      });
    });
    // 期望时间：指定日期 → 显示日期输入
    var timeSel = form.querySelector('select[name="timeType"]');
    var dateField = document.getElementById('dateField');
    if (timeSel && dateField) {
      timeSel.addEventListener('change', function () {
        dateField.classList.toggle('is-hidden', timeSel.value !== 'date');
      });
    }

    var setError = function (input, msg) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.toggle('has-error', !!msg);
      var err = field.querySelector('.field-error');
      if (err) err.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    var getService = function () {
      var c = form.querySelector('input[name="service"]:checked');
      return c ? c.value : '';
    };

    var validators = {
      service: function () { return getService() ? '' : '请选择服务需求类型'; },
      region: function (v) {
        v = v.trim();
        if (!v) return '请填写项目所在地区';
        if (v.length < 2 || v.length > 80) return '地区长度需在 2–80 个字符之间';
        return '';
      },
      phone: function (v) {
        v = v.trim();
        if (!v) return '请填写联系电话';
        if (!/^[0-9+\-\s()]+$/.test(v)) return '电话仅支持数字、空格、+、-、括号';
        var digits = v.replace(/\D/g, '');
        if (v.length < 7 || v.length > 20) return '电话总长度需在 7–20 个字符之间';
        if (digits.length < 7 || digits.length > 15) return '电话数字位数需在 7–15 位之间';
        return '';
      },
      name: function (v) { return v.trim().length > 30 ? '称呼不超过 30 个字符' : ''; },
      area: function (v) {
        v = v.trim();
        if (!v) return '';
        if (!(parseFloat(v) > 0)) return '面积需为正数；不确定可留空';
        return '';
      },
      message: function (v) { return v.trim().length > 500 ? '补充内容不超过 500 个字符（当前 ' + v.trim().length + '）' : ''; },
      privacy: function (input) { return input.checked ? '' : '请先阅读并勾选隐私确认'; }
    };

    var validateField = function (el) {
      var name = el.name;
      var fn = validators[name];
      if (!fn) return true;
      var msg = fn(el.type === 'checkbox' ? el : el.value);
      setError(el, msg);
      return !msg;
    };

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () {
        // 单选组：任一 radio 校验即整组校验
        if (el.name === 'service' && el.type === 'radio') {
          var checked = form.querySelector('input[name="service"]:checked');
          validateField(checked || el);
          return;
        }
        validateField(el);
      });
      el.addEventListener('input', function () {
        if (el.closest('.field') && el.closest('.field').classList.contains('has-error')) validateField(el);
      });
      el.addEventListener('change', function () {
        if (el.name === 'service') validateField(getServiceEl());
      });
    });
    var getServiceEl = function () {
      return form.querySelector('input[name="service"]:checked') || form.querySelector('input[name="service"]');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.name === 'areaUnit' || el.name === 'timeDate') return;
        if (el.type === 'radio' && el.name === 'service') {
          if (!firstBad && !validateField(getServiceEl())) firstBad = getServiceEl();
          return;
        }
        if (!validateField(el) && !firstBad) firstBad = el;
      });
      if (firstBad) {
        firstBad.focus();
        if (status) { status.textContent = '请检查标红的字段后重新提交。'; status.classList.add('is-error'); }
        return;
      }
      if (status) { status.textContent = ''; status.classList.remove('is-error'); }

      // demo 模式（PRD §7.4）：后端未接入 → 不伪装成功，不做假编号
      if (CFG.formMode === 'demo') {
        if (demoNote) demoNote.classList.add('is-visible');
        if (submitBtn) submitBtn.disabled = false; // 允许继续编辑，无需重复提交语义
        demoNote && demoNote.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      // 正式模式：此处接入受控提交接口（持久化 + 幂等 + 通知，见 PRD §8）
    });
  }

  /* ---------- 移动端联系条：聚焦输入时隐藏（PRD §10.2） ---------- */
  var focusables = document.querySelectorAll('input, textarea, select');
  if (focusables.length) {
    focusables.forEach(function (el) {
      el.addEventListener('focusin', function () { document.body.classList.add('contactbar-hidden'); });
      el.addEventListener('focusout', function () { document.body.classList.remove('contactbar-hidden'); });
    });
  }

  /* ---------- 年份 ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
