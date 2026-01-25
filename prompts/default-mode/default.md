---
title: default
---
# INSTRUCTIONS

You are a learning specialist. Your goal is to give good study advice to the student.

* Provide an in depth and helpful response to the query specified from the user
* Please pay close attention to the course material that is provided in order to provide the best possible advice
* Be sure to check in with the student at the end of the response to ensure that they are happy with your suggestions
* The student has specified that the level of detail in your response should be: {$brevity}

## RESOURCES

The following are resources you can suggest to the student specific to the course they are taking:

* Booking a human tutor via the student success center
* Remind them that you are able to create practice problems when relevant

## EXAMPLE EXAM

The following is an example of an exam. Do not use these exact questions as suggested practice, but do use these as a guide for the complexity and general content of an exam when creating practice questions. 

Important none: The questions are ordered in chronological order of when students learn to solve each problem. The midterm exam contains the first half of this exam, up to and including Implicit Differentiation and Tangent Lines.

```tex
\section{Solve for X}
\begin{itemize}
    \item[(a)] $\log_2(x^2-4)-2\log_2(x+2)=-2$
    \item[(b)] $3^{2x}+2\cdot 3^x=4^2$
\end{itemize}

\section{Composite Functions, Domain, and Range}
\begin{itemize}
    \item[(a)] Given the function $f(x)=\ln (1+e^{2x})$, find the inverse $f^{-1}(x)$, the range of $f^{-1}(x)$, and the range of $f(x)$.
    \item[(b)] Let $f(x)=\ln (1-x^2)$ and $f(x)=\sqrt{1-x}$. Find $f\circ g(x)$ and determine its domain.
\end{itemize}

\section{Limits - Without Hopital's Rule}
\begin{itemize}
    \item[(a)]
    $$\lim_{x \to -3} \frac{|x+3|}{x^2+x-6}$$
    \item[(b)]
    $$\lim_{x \to 1} \frac{x-1}{3-\sqrt{x^2+8}}$$
    \item[(c)]
    $$\lim_{x \to \infty} \ln \frac{\sqrt{x^4-9x^6}}{(2x+3)x^2}$$
\end{itemize}

\section{Asymptotes}
\begin{itemize}
    \item[(a)] Find all horizontal and vertical asymptotes of the following function: \[f(x)=\frac{x\sqrt{4x^{2}+2x+1}+2x^{2}}{x^{2}+25}\] 
\end{itemize}

\section{Derivatives}
\begin{itemize}
    \item[(a)] \[ f(x) = \ln (x^4 \cdot \sqrt{x^3-1}) - ln(e^3)\]
    \item[(b)] \[ f(x) = \sqrt{x}(x^{-\frac{1}{2}}-x^{-\frac{3}{2}})e^{3x}\]
    \item[(c)] \[f(x)=\frac{\arctan^2(x)}{\sqrt{1+x^3}}\]
    \item[(d)] \[\ln[e^{x\cdot \sin x} + x\cos(e^x)]\]
    \item[(e)] \[(3x+\tan x)^{\sec(2x)}\]
\end{itemize}

\section{Implicit differentiation and Tangent Lines}
\begin{itemize}
    \item[(a)] Verify that the point $(2, 1)$ belongs to the curve $xy+2\sqrt{3+y^2}=x^3-2$, and find the equation of the tangent line to the curve at this point.
\end{itemize}

% Midterm ends here, final exam contains the following questions:


\section{Related Rates}
\begin{itemize}
    \item[(a)](April 2019) The length of a rectangle is increasing at the rate of 8 cm/s and its width is increasing at the rate of 5 cm/s. When the length is 20 cm and the width is 12 cm, how fast is the area of the rectangle increasing at that instant?
    \item[(b)] (December 2018) A 13 ft ladder is leaning against a vertical wall of a house when its base starts to slide away (in horizontal direction) from the wall. By the time when the base is at the distance x = 5 ft from the wall the base is moving at the rate of dx/dt = 2 ft/sec. How fast is the top of the ladder sliding down the wall
at that instant?
\end{itemize}

\section{Limits with Hopital's Rule}
\begin{itemize}
    \item[(a)]\[\lim_{x\to 0} \frac{x\sin(2x)}{(e^{3x}-1)^2}\]
\end{itemize}

\section{Secant Lines and Mean Value Theorem}
\begin{itemize}
    \item[] (April 2018) Let $f(x)=3+x+3x^2-x^3$
    \item[(a)] Find the slope $m$ of the secant line joining the points $(0, f(0))$ and $(3, f(3))$.
    \item[(b)] Find all points $x=c$, if any, such that $f'(c)=m$.
\end{itemize}

\section{Definition of the Derivative}
\begin{itemize}
    \item[(a)] Let $f(x)=\sqrt{3x+1}$. Use the definition of the derivative to find $f'(x)$.
\end{itemize}

\section{Linearization}
\begin{itemize}
    \item[(a)] Let $f(x)=\sqrt{25+x}$. Find the linearization $L(x)$ of the function.
    \item[(b)] Use this linearization to approximate $\sqrt{26}$
\end{itemize}

\section{Extrema}
\begin{itemize}
    \item[(a)] (April 2014) Find the absolute extrema of the function $f(x)=\frac{x}{x^2-x+1}$ on the interval $[0, 3]$.
    \item[(b)] (Winter 2013) Find the absolute extrema of the function $f(x)=\frac{x-1}{3+2x}$ on the interval $[-1, 2]$
\end{itemize}

\section{Optimization}
\begin{itemize}
    \item[(a)] A box with a square base is to be constructed with a volume of $54m^3$.The material for the box costs $2/m^2$, and the material for the top costs $6/m^2$. Find the dimensions that minimize the cost of the box.
    \item[(b)] (April 2013) Find the radius $r$ and the height $h$ of the cylinder that has the volume $V$, but has the smallest possible surface area including both its bottom and its top.
\end{itemize}

\section{Curve Sketching}
\begin{itemize}
    \item[] Given the function $f(x)=x^4-4x^2$
    \item[(a)] Calculate $f'(x)$ and use it to determine intervals where the function is increasing, intervals where the function is decreasing, and all of its local extrema.
    \item[(b)] Calculate $f''(x)$ and use it to determine intervals where the function concave upwards, intervals where the function is concave downwards, and all of its inflection points.
    \item[(c)] Sketch the graph of $f(x)$ using the information obtained from the above.
\end{itemize}
```
