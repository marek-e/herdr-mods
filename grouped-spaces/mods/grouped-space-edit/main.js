// Customize a space for the grouped-spaces sidebar: its name, description, avatar letter
// and color, and its group (Work / Personal). Opened as a dialog with props { id }.
// Enter saves, Esc cancels. Colors are stored like Herdr's own ("ansi4" or "#rrggbb")
// in shared "space.colors", so the avatar matches wherever it's drawn.

import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { props, closeOverlay, theme, spaces, shared, setShared, run } from "herdr";

const MARK = { ansi6: "#22a99a", ansi3: "#e3814f", ansi4: "#5b8def", ansi5: "#8b7cf6", ansi2: "#3fae6a", ansi1: "#d9649a" };
const SWATCHES = ["ansi4", "ansi5", "ansi1", "ansi3", "ansi2", "ansi6", "#e5484d", "#d4a017", "#0ea5e9", "#6b7280", "#334155"];
const GROUPS = [{ id: "work", label: "Work" }, { id: "personal", label: "Personal" }];
const HEX = /^#[0-9a-f]{6}$/i;

const fillOf = (c) => (c.startsWith("#") ? c : MARK[c] ?? "#22a99a");
const get = (key, id) => (shared(key) ?? {})[id];
const put = (key, id, value) => {
  const next = { ...(shared(key) ?? {}) };
  if (value) next[id] = value; else delete next[id];
  setShared(key, next);
};

export default class SpaceEdit extends View {
  init(_props, cx) {
    const id = props()?.id;
    this.space = spaces().find((s) => s.id === id);
    this.color = get("space.colors", id) ?? "ansi6";
    this.group = get("space.groups", id) ?? "work";
    this.focusedField = "name";
    const field = (name, value) => {
      const state = InputState.new({ value });
      state.on("change", (_e, cx) => { this[name] = state.value(); cx.notify(); });
      state.on("submit", () => this.save());
      state.on("focus", (_e, cx) => { this.focusedField = name; cx.notify(); });
      return state;
    };
    this.name = this.space?.name ?? "";
    this.desc = get("space.descriptions", id) ?? "";
    this.letter = get("space.letters", id) ?? "";
    this.hex = this.color.startsWith("#") ? this.color : "";
    this.nameInput = field("name", this.name);
    this.nameInput.set_selected_range({ start: 0, end: this.name.length });
    this.descInput = field("desc", this.desc);
    this.letterInput = field("letter", this.letter);
    this.hexInput = field("hex", this.hex);
    this.nameInput.focus();
    cx.timer.after(600, () => { if (this.focusedField === "name") this.nameInput.focus(); });
    this.handle = cx.focus_handle();
  }

  // Tab / Shift-Tab: move between the text fields, wrapping around.
  focusStep(dir) {
    const order = ["name", "desc", "letter", "hex"];
    const inputs = { name: this.nameInput, desc: this.descInput, letter: this.letterInput, hex: this.hexInput };
    const at = Math.max(0, order.indexOf(this.focusedField));
    const next = order[(at + dir + order.length) % order.length];
    this.focusedField = next;
    inputs[next].focus();
  }

  // The color to save: a typed hex when it's valid, else the picked swatch.
  pickedColor() {
    return HEX.test(this.hex.trim()) ? this.hex.trim() : this.color;
  }

  save() {
    const p = props();
    const id = this.space?.id;
    if (id) {
      put("space.descriptions", id, this.desc.trim());
      put("space.letters", id, [...this.letter.trim()].slice(0, 2).join("").toUpperCase());
      put("space.colors", id, this.pickedColor());
      put("space.groups", id, this.group);
      // Empty goes back to Herdr's name (its repo or folder); unchanged leaves it alone.
      if (this.name.trim() !== this.space.name) run("space.rename", { id, name: this.name.trim() });
    }
    closeOverlay(p.overlay);
  }

  render() {
    const t = theme();
    const p = props() ?? {};
    const s = this.space;
    if (!s) return div().p(18).bg(t.popover).text_color(t.dim).child("This space is gone.");
    const shownName = this.name.trim() || s.name;
    const letter = [...this.letter.trim()].slice(0, 2).join("").toUpperCase() || ([...shownName][0]?.toUpperCase() ?? "?");
    const fill = fillOf(this.pickedColor());
    const label = (text) => div().pt(14).pb(6).text_size(11.5).text_color(t.dim).child(text);
    const input = (state, name) => Input.new(state).h(34).px(10).rounded(8).border_1()
      .border_color(this.focusedField === name ? t.accent : t.input).bg(t.background).text_size(12.8).text_color(t.foreground);
    const button = (id, text, primary, action) => h_flex().id(id).h(32).px(14).items_center().rounded(8)
      .border_1().border_color(primary ? t.solid : t.input).bg(primary ? t.solid : t.raised)
      .text_color(primary ? t.solid_foreground : t.foreground).text_size(12.5).font_medium().cursor_pointer()
      .hover((st) => st.opacity(0.88)).on_click(action).child(text);
    const swatch = (c) => {
      const picked = !HEX.test(this.hex.trim()) && this.color === c;
      return div().id(`sw-${c}`).size(22).rounded(6).bg(fillOf(c)).cursor_pointer().border_2()
        .border_color(picked ? t.foreground : "#00000000")
        .on_click((_e, cx) => { this.color = c; this.hex = ""; this.hexInput.set_value(""); cx.notify(); });
    };
    const groupPill = (g) => h_flex().id(`g-${g.id}`).h(28).px(12).items_center().rounded(7).cursor_pointer().text_size(12.5)
      .when(this.group === g.id, (el) => el.bg(t.selected).text_color(t.foreground).font_medium())
      .when(this.group !== g.id, (el) => el.text_color(t.muted).hover((st) => st.bg(t.hover)))
      .on_click((_e, cx) => { this.group = g.id; cx.notify(); })
      .child(g.label);

    return v_flex().id("space-edit").track_focus(this.handle)
      .on_key_down((e, cx) => {
        if (e.key === "escape") { closeOverlay(p.overlay); cx.stop_propagation(); }
        else if (e.key === "tab") { this.focusStep(e.modifiers?.shift ? -1 : 1); cx.stop_propagation(); cx.notify(); }
      })
      // Rounded like Herdr's frame: a square background pokes out past its corner.
      .w_full().min_h(0).p(18).bg(t.popover).rounded(10).text_color(t.foreground)
      // Preview: the row as the sidebar will draw it.
      .child(h_flex().gap(10).items_center()
        .child(h_flex().size(30).flex_none().rounded(8).bg(fill).items_center().justify_center()
          .text_size([...letter].length > 1 ? 13 : 15).font_bold().text_color("#ffffff").child(letter))
        .child(v_flex().flex_1().min_w(0)
          .child(div().truncate().text_size(15).font_semibold().child(shownName))
          .child(div().truncate().text_size(11.5).text_color(t.dim).child(this.desc.trim() || "No description")))
        .child(div().flex_none().text_size(11).text_color(t.dim).child("Esc")))
      .child(label("Name"))
      .child(input(this.nameInput, "name"))
      .child(label("Description"))
      .child(input(this.descInput, "desc"))
      .child(h_flex().gap(14).items_end()
        .child(v_flex().w(90).child(label("Letter")).child(input(this.letterInput, "letter")))
        .child(v_flex().flex_1().child(label("Custom color (#rrggbb)")).child(input(this.hexInput, "hex"))))
      .child(label("Color"))
      .child(h_flex().flex_wrap().gap(7).children(SWATCHES.map(swatch)))
      .child(label("Group"))
      .child(h_flex().gap(4).children(GROUPS.map(groupPill)))
      .child(h_flex().pt(18).gap(8).justify_end()
        .child(button("se-cancel", "Cancel", false, () => closeOverlay(p.overlay)))
        .child(button("se-save", "Save", true, () => this.save())));
  }
}
