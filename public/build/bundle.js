
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Sakums.svelte generated by Svelte v3.42.1 */
    const file$4 = "src\\Sakums.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div2;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let ol0;
    	let li0;
    	let t8;
    	let u;
    	let t10;
    	let t11;
    	let li1;
    	let t13;
    	let li2;
    	let t14;
    	let button;
    	let t16;
    	let t17;
    	let li3;
    	let t18;
    	let a0;
    	let t20;
    	let t21;
    	let li4;
    	let t23;
    	let p3;
    	let t25;
    	let ol1;
    	let li5;
    	let t27;
    	let li6;
    	let t29;
    	let li7;
    	let t31;
    	let p4;
    	let t33;
    	let ol2;
    	let li8;
    	let t35;
    	let li9;
    	let t37;
    	let li10;
    	let t38;
    	let strong;
    	let t40;
    	let li11;
    	let t42;
    	let p5;
    	let t43;
    	let a1;
    	let t45;
    	let t46;
    	let div1;
    	let div0;
    	let a2;
    	let t47;
    	let small;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Fizikas Komandu Olimpiāde 2020./2021.";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Sveiks!";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Ar prieku paziņojam, ka arī šogad notiks Fizikas Komandu Olimpiāde! Olimpiāde norisināsies 27. februārī, no 10.00 līdz 13.00, attālinātā formā, izmantojot edu.lu.lv vidi.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Ja esi 8. – 12. klases skolēns un vēlies piedalīties olimpiādē, rīkojies šādi:";
    			t7 = space();
    			ol0 = element("ol");
    			li0 = element("li");
    			t8 = text("Atrodi citus fizikas entuziastus un savāc 2 – 5 cilvēku komandu. Visiem komandas dalībniekiem ");
    			u = element("u");
    			u.textContent = "nav";
    			t10 = text(" jābūt no vienas skolas vai klases.");
    			t11 = space();
    			li1 = element("li");
    			li1.textContent = "Pārliecinies, vai visi komandas dalībnieki ir reģistrēti edu.lu.lv vietnē. Ja kādreiz esi piedalījies fizikas, ķīmijas, bioloģijas vai citās novada olimpiādēs, tu visticamāk esi reģistrēts! Ja kādam komandas dalībniekam nav edu.lu.lv konta, to var iegūt pie savas skolas atbildīgā par olimpiādēm (pajautā savam fizikas skolotājam!).";
    			t13 = space();
    			li2 = element("li");
    			t14 = text("Dodies uz šīs vietnes sadaļu ");
    			button = element("button");
    			button.textContent = "Pieteikšanās";
    			t16 = text(" un aizpildi tur redzamo anketu!");
    			t17 = space();
    			li3 = element("li");
    			t18 = text("48 stundu laikā pēc anketas iesniegšanas katrs komandas dalībnieks tiks reģistrēts komandu olimpiādes edu.lu.lv kursā. Ieejot vietnē edu.lu.lv, tev vajadzētu redzēt kursu Fizikas Komandu Olimpiāde. Ja nedēļu pēc reģistrācijas neredzi šo kursu, raksti uz e-pastu ");
    			a0 = element("a");
    			a0.textContent = "fizikasko@gmail.com";
    			t20 = text("!");
    			t21 = space();
    			li4 = element("li");
    			li4.textContent = "Citu nepieciešamo informāciju atradīsi edu.lu.lv kursā vai olimpiādes nolikumā.";
    			t23 = space();
    			p3 = element("p");
    			p3.textContent = "Pirms 27. februāra pārliecinies, ka viss šeit uzskaitītais izpildās:";
    			t25 = space();
    			ol1 = element("ol");
    			li5 = element("li");
    			li5.textContent = "Visi komandas dalībnieki ir reģistrēti un var ieiet olimpiādes kursā edu.lu.lv.";
    			t27 = space();
    			li6 = element("li");
    			li6.textContent = "Komandai ir veids kā droši sazināties olimpiādes laikā – iesakām izmantot Zoom, Discord, Google Meet, Teams vai tamlīdzīgu saziņas veidu.";
    			t29 = space();
    			li7 = element("li");
    			li7.textContent = "Tu esi izlasījis olimpiādes noteikumus un saproti, kā norisināsies olimpiāde.";
    			t31 = space();
    			p4 = element("p");
    			p4.textContent = "Olimpiādes dienā:";
    			t33 = space();
    			ol2 = element("ol");
    			li8 = element("li");
    			li8.textContent = "Sākot no 10.00 katrs komandas dalībnieks varēs atvērt uzdevumus. To risināšanai būs dotas 3 astronomiskās stundas, laika atskaite katram dalībniekam ir individuāla.";
    			t35 = space();
    			li9 = element("li");
    			li9.textContent = "Uzdevumu izpildes laiks slēdzas 13.15 (neatkarīgi no sākšanas laika – sāc risināt uzdevumus starp 10.00 un 10.15)!";
    			t37 = space();
    			li10 = element("li");
    			t38 = text("Uzdevumus komanda risina kopīgi, bet katrā atbilžu lodziņā atbildi aicinām rakstīt tieši vienam dalībniekam. ");
    			strong = element("strong");
    			strong.textContent = "Ja uz vienu jautājumu atbildes būs iesnieguši vairāki komandas dalībnieki, jautājums netiks vērtēts, un komanda par to saņems 0 punktus.";
    			t40 = space();
    			li11 = element("li");
    			li11.textContent = "Uz katru jautājumu atbildēt var cits komandas dalībnieks – komandas darba vērtēšanā izmantosim visu dalībnieku iesniegtās atbildes.";
    			t42 = space();
    			p5 = element("p");
    			t43 = text("Ja tev ir kādas neskaidrības par olimpiādes norisi, raksti uz e-pastu ");
    			a1 = element("a");
    			a1.textContent = "fizikasko@gmail.com";
    			t45 = text("!");
    			t46 = space();
    			div1 = element("div");
    			div0 = element("div");
    			a2 = element("a");
    			t47 = text("📄 Nolikums ");
    			small = element("small");
    			small.textContent = "(pdf)";
    			attr_dev(h1, "class", "svelte-dfpm5r");
    			add_location(h1, file$4, 13, 8, 243);
    			add_location(p0, file$4, 14, 8, 299);
    			add_location(p1, file$4, 15, 8, 323);
    			add_location(p2, file$4, 16, 8, 510);
    			add_location(u, file$4, 18, 110, 721);
    			add_location(li0, file$4, 18, 12, 623);
    			add_location(li1, file$4, 19, 12, 785);
    			attr_dev(button, "class", "svelte-dfpm5r");
    			add_location(button, file$4, 20, 45, 1174);
    			add_location(li2, file$4, 20, 12, 1141);
    			attr_dev(a0, "class", "mailLink svelte-dfpm5r");
    			attr_dev(a0, "href", "mailto:fizikasko@gmail.com");
    			add_location(a0, file$4, 21, 278, 1540);
    			add_location(li3, file$4, 21, 12, 1274);
    			add_location(li4, file$4, 22, 12, 1637);
    			add_location(ol0, file$4, 17, 8, 605);
    			add_location(p3, file$4, 24, 8, 1750);
    			add_location(li5, file$4, 26, 12, 1854);
    			add_location(li6, file$4, 27, 12, 1956);
    			add_location(li7, file$4, 28, 12, 2117);
    			add_location(ol1, file$4, 25, 8, 1836);
    			add_location(p4, file$4, 30, 8, 2228);
    			add_location(li8, file$4, 32, 12, 2281);
    			add_location(li9, file$4, 33, 12, 2469);
    			add_location(strong, file$4, 34, 125, 2720);
    			add_location(li10, file$4, 34, 12, 2607);
    			add_location(li11, file$4, 35, 12, 2893);
    			add_location(ol2, file$4, 31, 8, 2263);
    			attr_dev(a1, "class", "mailLink svelte-dfpm5r");
    			attr_dev(a1, "href", "mailto:fizikasko@gmail.com");
    			add_location(a1, file$4, 37, 81, 3131);
    			add_location(p5, file$4, 37, 8, 3058);
    			add_location(small, file$4, 40, 78, 3373);
    			attr_dev(a2, "class", "dokSaite svelte-dfpm5r");
    			attr_dev(a2, "href", "/FKO_Nolikums_2021.pdf");
    			add_location(a2, file$4, 40, 16, 3311);
    			attr_dev(div0, "class", "dokDiv");
    			add_location(div0, file$4, 39, 12, 3273);
    			set_style(div1, "display", "inline-block");
    			add_location(div1, file$4, 38, 8, 3223);
    			attr_dev(div2, "class", "text svelte-dfpm5r");
    			add_location(div2, file$4, 12, 4, 215);
    			add_location(main, file$4, 11, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, p0);
    			append_dev(div2, t3);
    			append_dev(div2, p1);
    			append_dev(div2, t5);
    			append_dev(div2, p2);
    			append_dev(div2, t7);
    			append_dev(div2, ol0);
    			append_dev(ol0, li0);
    			append_dev(li0, t8);
    			append_dev(li0, u);
    			append_dev(li0, t10);
    			append_dev(ol0, t11);
    			append_dev(ol0, li1);
    			append_dev(ol0, t13);
    			append_dev(ol0, li2);
    			append_dev(li2, t14);
    			append_dev(li2, button);
    			append_dev(li2, t16);
    			append_dev(ol0, t17);
    			append_dev(ol0, li3);
    			append_dev(li3, t18);
    			append_dev(li3, a0);
    			append_dev(li3, t20);
    			append_dev(ol0, t21);
    			append_dev(ol0, li4);
    			append_dev(div2, t23);
    			append_dev(div2, p3);
    			append_dev(div2, t25);
    			append_dev(div2, ol1);
    			append_dev(ol1, li5);
    			append_dev(ol1, t27);
    			append_dev(ol1, li6);
    			append_dev(ol1, t29);
    			append_dev(ol1, li7);
    			append_dev(div2, t31);
    			append_dev(div2, p4);
    			append_dev(div2, t33);
    			append_dev(div2, ol2);
    			append_dev(ol2, li8);
    			append_dev(ol2, t35);
    			append_dev(ol2, li9);
    			append_dev(ol2, t37);
    			append_dev(ol2, li10);
    			append_dev(li10, t38);
    			append_dev(li10, strong);
    			append_dev(ol2, t40);
    			append_dev(ol2, li11);
    			append_dev(div2, t42);
    			append_dev(div2, p5);
    			append_dev(p5, t43);
    			append_dev(p5, a1);
    			append_dev(p5, t45);
    			append_dev(div2, t46);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a2);
    			append_dev(a2, t47);
    			append_dev(a2, small);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchPG*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sakums', slots, []);
    	const dispatch = createEventDispatcher();

    	const switchPG = () => {
    		dispatch("switchPie", 2);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sakums> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		switchPG
    	});

    	return [switchPG];
    }

    class Sakums extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sakums",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Piesakies.svelte generated by Svelte v3.42.1 */

    const file$3 = "src\\Piesakies.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Pieteikšanās Fizikas Komandu Olimpiādei 2020./2021.";
    			t1 = space();
    			iframe = element("iframe");
    			iframe.textContent = "Notiek ielāde…";
    			attr_dev(h1, "class", "svelte-uhbkz4");
    			add_location(h1, file$3, 1, 0, 8);
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://docs.google.com/forms/d/e/1FAIpQLSfSRGk6yNQ5wZE6IDBpV3Fm2wm1T0TNVZjwI3vSSPD4Fo31-w/viewform?embedded=true")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "600");
    			attr_dev(iframe, "title", "Forms");
    			attr_dev(iframe, "height", "2500");
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "marginheight", "0");
    			attr_dev(iframe, "marginwidth", "0");
    			add_location(iframe, file$3, 2, 0, 70);
    			add_location(main, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, iframe);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Piesakies', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Piesakies> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Piesakies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Piesakies",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Arhivs.svelte generated by Svelte v3.42.1 */

    const file$2 = "src\\Arhivs.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h20;
    	let t3;
    	let div2;
    	let div0;
    	let a0;
    	let t5;
    	let div1;
    	let a1;
    	let t7;
    	let h21;
    	let t9;
    	let div8;
    	let div3;
    	let a2;
    	let t11;
    	let div4;
    	let a3;
    	let t13;
    	let div5;
    	let a4;
    	let t15;
    	let div6;
    	let a5;
    	let t17;
    	let div7;
    	let a6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Arhīvs";
    			t1 = space();
    			h20 = element("h2");
    			h20.textContent = "2020./2021. gada atrisinājumi";
    			t3 = space();
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "📄 8. un 9. klase";
    			t5 = space();
    			div1 = element("div");
    			a1 = element("a");
    			a1.textContent = "📄 10. un 11. klase";
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "2019./2020. gada uzdevumi";
    			t9 = space();
    			div8 = element("div");
    			div3 = element("div");
    			a2 = element("a");
    			a2.textContent = "📄 8. klase";
    			t11 = space();
    			div4 = element("div");
    			a3 = element("a");
    			a3.textContent = "📄 9. klase";
    			t13 = space();
    			div5 = element("div");
    			a4 = element("a");
    			a4.textContent = "📄 10. klase";
    			t15 = space();
    			div6 = element("div");
    			a5 = element("a");
    			a5.textContent = "📄 11. klase";
    			t17 = space();
    			div7 = element("div");
    			a6 = element("a");
    			a6.textContent = "📄 Laboratorijas darbs";
    			attr_dev(h1, "class", "svelte-186bx3t");
    			add_location(h1, file$2, 1, 4, 12);
    			attr_dev(h20, "class", "arhivsTitle svelte-186bx3t");
    			add_location(h20, file$2, 2, 4, 33);
    			attr_dev(a0, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a0, "href", "/arhivs/2021/FKO2021_risinajumi_8-9.pdf");
    			add_location(a0, file$2, 5, 12, 177);
    			attr_dev(div0, "class", "dokDiv");
    			add_location(div0, file$2, 4, 8, 143);
    			attr_dev(a1, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a1, "href", "/arhivs/2021/FKO2021_risinajumi_10-11.pdf");
    			add_location(a1, file$2, 8, 12, 325);
    			attr_dev(div1, "class", "dokDiv");
    			add_location(div1, file$2, 7, 8, 291);
    			set_style(div2, "display", "inline-block");
    			add_location(div2, file$2, 3, 4, 97);
    			attr_dev(h21, "class", "arhivsTitle svelte-186bx3t");
    			add_location(h21, file$2, 11, 4, 451);
    			attr_dev(a2, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a2, "href", "/arhivs/2020/uzdevumi/8_klase.docx");
    			add_location(a2, file$2, 14, 12, 591);
    			attr_dev(div3, "class", "dokDiv");
    			add_location(div3, file$2, 13, 8, 557);
    			attr_dev(a3, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a3, "href", "/arhivs/2020/uzdevumi/9_klase.docx");
    			add_location(a3, file$2, 17, 12, 728);
    			attr_dev(div4, "class", "dokDiv");
    			add_location(div4, file$2, 16, 8, 694);
    			attr_dev(a4, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a4, "href", "/arhivs/2020/uzdevumi/10_klase.docx");
    			add_location(a4, file$2, 20, 12, 866);
    			attr_dev(div5, "class", "dokDiv");
    			add_location(div5, file$2, 19, 8, 831);
    			attr_dev(a5, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a5, "href", "/arhivs/2020/uzdevumi/11_klase.docx");
    			add_location(a5, file$2, 23, 12, 1005);
    			attr_dev(div6, "class", "dokDiv");
    			add_location(div6, file$2, 22, 8, 971);
    			attr_dev(a6, "class", "dokSaite svelte-186bx3t");
    			attr_dev(a6, "href", "/arhivs/2020/uzdevumi/Laboratorijas_darbs.docx");
    			add_location(a6, file$2, 26, 12, 1144);
    			attr_dev(div7, "class", "dokDiv");
    			add_location(div7, file$2, 25, 8, 1110);
    			set_style(div8, "display", "inline-block");
    			add_location(div8, file$2, 12, 4, 511);
    			add_location(main, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, h20);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(main, t7);
    			append_dev(main, h21);
    			append_dev(main, t9);
    			append_dev(main, div8);
    			append_dev(div8, div3);
    			append_dev(div3, a2);
    			append_dev(div8, t11);
    			append_dev(div8, div4);
    			append_dev(div4, a3);
    			append_dev(div8, t13);
    			append_dev(div8, div5);
    			append_dev(div5, a4);
    			append_dev(div8, t15);
    			append_dev(div8, div6);
    			append_dev(div6, a5);
    			append_dev(div8, t17);
    			append_dev(div8, div7);
    			append_dev(div7, a6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Arhivs', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Arhivs> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Arhivs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arhivs",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Par.svelte generated by Svelte v3.42.1 */

    const file$1 = "src\\Par.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let br;
    	let t8;
    	let h2;
    	let t10;
    	let div;
    	let img0;
    	let img0_src_value;
    	let t11;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let img3;
    	let img3_src_value;
    	let t14;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Par mums";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Latvijas skolēnam ir vairākas iespējas pārbaudīt savas fizikas zināšanas individuāli, piemēram, Valsts Fizikas olimpiādē vai Atklātajā fizikas olimpiādē. Olimpiādes mērķis ir popularizēt fiziku skolēnu vidū, attīstīt prasmes strādāt komandā, kā arī sagatavot skolēnus valsts un starptautiska līmeņa olimpiādēm fizikā, iepazīstinot ar idejām, tehnikām un uzdevumiem, kas var parādīties šādās olimpiādēs.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Olimipādi organizē skolēnu un absolventu komanda no Rīgas Valsts 1. ģimnāzijas. 2020./2021. gadā to sastāda Rolands Lopatko, Jānis Pudāns, Kims Georgs Pavlovs, Ilmārs Štolcers, Vilhelms Cinis, Daniels Gorovojs, Olivers Prānis, Ričards Kristers Knipšis, Oskars Mednis, Gustavs Švalbe un citi.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Izsakām pateicību arī Atai Krūmiņai, Pēterim Bricam un citiem Rīgas Valsts 1. ģimnāzijas skolotājiem.";
    			t7 = space();
    			br = element("br");
    			t8 = space();
    			h2 = element("h2");
    			h2.textContent = "Olimpiādes atbalstītāji";
    			t10 = space();
    			div = element("div");
    			img0 = element("img");
    			t11 = space();
    			img1 = element("img");
    			t12 = space();
    			img2 = element("img");
    			t13 = space();
    			img3 = element("img");
    			t14 = space();
    			img4 = element("img");
    			attr_dev(h1, "class", "svelte-fd9wva");
    			add_location(h1, file$1, 1, 4, 12);
    			attr_dev(p0, "class", "svelte-fd9wva");
    			add_location(p0, file$1, 2, 4, 35);
    			attr_dev(p1, "class", "svelte-fd9wva");
    			add_location(p1, file$1, 3, 4, 450);
    			attr_dev(p2, "class", "svelte-fd9wva");
    			add_location(p2, file$1, 4, 4, 754);
    			add_location(br, file$1, 5, 4, 868);
    			add_location(h2, file$1, 6, 4, 878);
    			if (!src_url_equal(img0.src, img0_src_value = "atbalstitaji/cfi.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Cietvielu fizikas institūts");
    			attr_dev(img0, "class", "sponsorItem");
    			add_location(img0, file$1, 8, 8, 947);
    			if (!src_url_equal(img1.src, img1_src_value = "atbalstitaji/latvenergo.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Latvenergo");
    			attr_dev(img1, "class", "sponsorItem");
    			add_location(img1, file$1, 9, 8, 1043);
    			if (!src_url_equal(img2.src, img2_src_value = "atbalstitaji/lvm.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Latvijas Valsts meži");
    			attr_dev(img2, "class", "sponsorItem");
    			add_location(img2, file$1, 10, 8, 1129);
    			if (!src_url_equal(img3.src, img3_src_value = "atbalstitaji/tet.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "TET");
    			attr_dev(img3, "class", "sponsorItem sponsorDark tetSponsor");
    			add_location(img3, file$1, 11, 8, 1218);
    			if (!src_url_equal(img4.src, img4_src_value = "atbalstitaji/tet_balts.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "TET");
    			attr_dev(img4, "class", "sponsorItem sponsorLight tetSponsor");
    			add_location(img4, file$1, 12, 8, 1313);
    			attr_dev(div, "id", "sponsorBox");
    			add_location(div, file$1, 7, 4, 916);
    			add_location(main, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(main, t3);
    			append_dev(main, p1);
    			append_dev(main, t5);
    			append_dev(main, p2);
    			append_dev(main, t7);
    			append_dev(main, br);
    			append_dev(main, t8);
    			append_dev(main, h2);
    			append_dev(main, t10);
    			append_dev(main, div);
    			append_dev(div, img0);
    			append_dev(div, t11);
    			append_dev(div, img1);
    			append_dev(div, t12);
    			append_dev(div, img2);
    			append_dev(div, t13);
    			append_dev(div, img3);
    			append_dev(div, t14);
    			append_dev(div, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Par', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Par> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Par extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Par",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\App.svelte";

    // (35:1) {:else}
    function create_else_block(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Neatradu lapu...";
    			add_location(h1, file, 35, 1, 891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(35:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:22) 
    function create_if_block_3(ctx) {
    	let par;
    	let current;
    	par = new Par({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(par.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(par, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(par.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(par.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(par, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(33:22) ",
    		ctx
    	});

    	return block;
    }

    // (31:22) 
    function create_if_block_2(ctx) {
    	let arhivs;
    	let current;
    	arhivs = new Arhivs({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(arhivs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arhivs, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arhivs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arhivs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arhivs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(31:22) ",
    		ctx
    	});

    	return block;
    }

    // (29:22) 
    function create_if_block_1(ctx) {
    	let piesakies;
    	let current;
    	piesakies = new Piesakies({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(piesakies.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(piesakies, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(piesakies.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(piesakies.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(piesakies, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(29:22) ",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if menu === 1}
    function create_if_block(ctx) {
    	let sakums;
    	let current;
    	sakums = new Sakums({ $$inline: true });
    	sakums.$on("switchPie", /*switchMenu*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(sakums.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sakums, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sakums.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sakums.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sakums, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(27:1) {#if menu === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let ul;
    	let li0;
    	let a0;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let li2;
    	let a2;
    	let t8;
    	let li3;
    	let a3;
    	let t10;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*menu*/ ctx[0] === 1) return 0;
    		if (/*menu*/ ctx[0] === 2) return 1;
    		if (/*menu*/ ctx[0] === 3) return 2;
    		if (/*menu*/ ctx[0] === 4) return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Fizikas Komandu Olimpiāde";
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Sākums";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Piesakies";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Arhīvs";
    			t8 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Par Mums";
    			t10 = space();
    			div1 = element("div");
    			if_block.c();
    			if (!src_url_equal(img.src, img_src_value = "/logoBalts.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "FKO");
    			attr_dev(img, "class", "svelte-1w1n02n");
    			add_location(img, file, 15, 1, 280);
    			attr_dev(h1, "class", "svelte-1w1n02n");
    			add_location(h1, file, 16, 1, 319);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1w1n02n");
    			add_location(a0, file, 18, 6, 376);
    			attr_dev(li0, "class", "svelte-1w1n02n");
    			add_location(li0, file, 18, 2, 372);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-1w1n02n");
    			add_location(a1, file, 19, 6, 454);
    			attr_dev(li1, "class", "svelte-1w1n02n");
    			add_location(li1, file, 19, 2, 450);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-1w1n02n");
    			add_location(a2, file, 20, 6, 534);
    			attr_dev(li2, "class", "svelte-1w1n02n");
    			add_location(li2, file, 20, 2, 530);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "svelte-1w1n02n");
    			add_location(a3, file, 21, 6, 611);
    			attr_dev(li3, "class", "svelte-1w1n02n");
    			add_location(li3, file, 21, 2, 607);
    			attr_dev(ul, "id", "menu");
    			attr_dev(ul, "class", "svelte-1w1n02n");
    			add_location(ul, file, 17, 1, 355);
    			attr_dev(div0, "class", "header svelte-1w1n02n");
    			add_location(div0, file, 14, 0, 258);
    			attr_dev(div1, "class", "page svelte-1w1n02n");
    			add_location(div1, file, 25, 0, 700);
    			add_location(main, file, 13, 0, 251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(main, t10);
    			append_dev(main, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[2]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[3]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_2*/ ctx[4]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_3*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { menu = 1 } = $$props;

    	const switchMenu = e => {
    		$$invalidate(0, menu = e.detail);
    	};

    	const writable_props = ['menu'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, menu = 1);
    	const click_handler_1 = () => $$invalidate(0, menu = 2);
    	const click_handler_2 = () => $$invalidate(0, menu = 3);
    	const click_handler_3 = () => $$invalidate(0, menu = 4);

    	$$self.$$set = $$props => {
    		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
    	};

    	$$self.$capture_state = () => ({
    		Sakums,
    		Piesakies,
    		Arhivs,
    		Par,
    		menu,
    		switchMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		menu,
    		switchMenu,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { menu: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get menu() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menu(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
