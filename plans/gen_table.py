

L = {
    "P1": (r"A ≥ 0, B ≥ 0", 
            r"ux& 0 \\ 0& uy",
            r"ubx \\ uby"),
    "P2": (r"A ≤ 0, A + α B ≥ 0",
            r"-udx/α& (uy - udy)/α \\ 0& uy",
            r"(uby - ubd)/𝛼 \\ uby"),
    "P3": (r"A ≤ 0, A + α B ≤ 0",
            r"lx& 0 \\ 𝛼 lx + udx& udy",
            r"lbx\\ 𝛼 lbx + ubd"),
}

def replace_exchange(a, b, c):
    return a.replace(b, "∞⊓𝜔∀𝜀𝜌⊓").replace(c, b).replace("∞⊓𝜔∀𝜀𝜌⊓", c)

def inverse_direction(a, b, c):
    return replace_exchange(a, "≤", "≥"), replace_exchange(b, "u", "l"), replace_exchange(c, "u", "l")

def make_latex(a):
    a = a.replace("A", "A_{i,j}").replace("B", "B_{i,j}")
    a = a.replace("ux", "\mathbf{u_x}_{j}").replace("uy", "\mathbf{u_y}_{j}")
    a = a.replace("ubx", "\mathbf{ub_x}_{j}").replace("uby", "\mathbf{ub_y}_{j}")
    a = a.replace("udx", "\mathbf{u_{\Delta x}}_{j}").replace("udy", "\mathbf{u_{\Delta y}}_{j}").replace("ubd", "\mathbf{ub_{\Delta}}_{j}")
    a = a.replace("lx", "\mathbf{l_x}_{j}").replace("ly", "\mathbf{l_y}_{j}")
    a = a.replace("lbx", "\mathbf{lb_x}_{j}").replace("lby", "\mathbf{lb_y}_{j}")
    a = a.replace("ldx", "\mathbf{l_{\Delta x}}_{j}").replace("ldy", "\mathbf{l_{\Delta y}}_{j}").replace("lbd", "\mathbf{lb_{\Delta}}_{j}")
    a = a.replace("α", r"\boldsymbol{\alpha}_{j}")
    a = a.replace("𝛼", r"\boldsymbol{\alpha}_{j}")
    return a



L["P4"] = inverse_direction(*L["P1"])
L["P5"] = inverse_direction(*L["P2"])
L["P6"] = inverse_direction(*L["P3"])

for k, (a, b, c) in L.items():
    print(f"| {k} | ${make_latex(a)}$ | $\\begin{{bmatrix}} {make_latex(b)} \\end{{bmatrix}}$ | $\\begin{{bmatrix}} {make_latex(c)} \\end{{bmatrix}}$ |")
