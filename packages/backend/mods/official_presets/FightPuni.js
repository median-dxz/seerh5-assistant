var D = Object.defineProperty;
var L = (N, M, I) => M in N ? D(N, M, { enumerable: !0, configurable: !0, writable: !0, value: I }) : N[M] = I;
var u = (N, M, I) => (L(N, typeof M != "symbol" ? M + "" : M, I), I);
const g = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iI0ZGRkZGRiI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE4LjYgNi42MmMtMS40NCAwLTIuOC41Ni0zLjc3IDEuNTNMNy44IDE0LjM5Yy0uNjQuNjQtMS40OS45OS0yLjQuOTktMS44NyAwLTMuMzktMS41MS0zLjM5LTMuMzhTMy41MyA4LjYyIDUuNCA4LjYyYy45MSAwIDEuNzYuMzUgMi40NCAxLjAzbDEuMTMgMSAxLjUxLTEuMzRMOS4yMiA4LjJDOC4yIDcuMTggNi44NCA2LjYyIDUuNCA2LjYyIDIuNDIgNi42MiAwIDkuMDQgMCAxMnMyLjQyIDUuMzggNS40IDUuMzhjMS40NCAwIDIuOC0uNTYgMy43Ny0xLjUzbDcuMDMtNi4yNGMuNjQtLjY0IDEuNDktLjk5IDIuNC0uOTkgMS44NyAwIDMuMzkgMS41MSAzLjM5IDMuMzhzLTEuNTIgMy4zOC0zLjM5IDMuMzhjLS45IDAtMS43Ni0uMzUtMi40NC0xLjAzbC0xLjE0LTEuMDEtMS41MSAxLjM0IDEuMjcgMS4xMmMxLjAyIDEuMDEgMi4zNyAxLjU3IDMuODIgMS41NyAyLjk4IDAgNS40LTIuNDEgNS40LTUuMzhzLTIuNDItNS4zNy01LjQtNS4zN3oiLz48L3N2Zz4=";
class j {
  constructor() {
    u(this, "logger");
    u(this, "meta", {
      id: "对战谱尼",
      scope: "median",
      type: "quick-access-plugin"
    });
    u(this, "icon", g);
  }
  click() {
    FightManager.fightNoMapBoss(6730);
  }
}
export {
  j as default
};
//# sourceMappingURL=FightPuni.js.map
