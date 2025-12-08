Holoboard

A high-performance, infinite canvas whiteboard application designed with a sci-fi modular aesthetic. Built for ideation, diagramming, and freeform creativity.

Project Overview

Holoboard is a web-based collaborative whiteboard tool that offers a true "infinite canvas" experience. We wanted to move away from generic designs and create something that mimics the feel of a futuristic digital interface, utilizing modular design elements and the Chakra Petch typeface. It allows users to draw, add shapes, connect ideas with arrows, and organize their thoughts spatially without running out of room.

Our primary focus was performance and ease of use. We built this using React Konva to ensure that interactions remain smooth—aiming for a consistent 60FPS—even when your diagrams get complex.

Problem Statement

PS Number: [2- Holoboard]

We noticed that traditional digital whiteboards often feel sluggish or lack a distinct visual identity. Holoboard was created to solve these specific friction points:

Seamless Navigation: We implemented an infinite pan-and-zoom interface so you never feel constrained by page borders.

Visual Cohesion: The strict "sci-fi industrial" design language ensures that your diagrams look consistent and professional automatically, without you needing to be a designer.

Performance: By using a lightweight architecture, the application runs entirely in the browser with no lag.

Features Implemented

Infinite Canvas: Pan and zoom capabilities allow you to navigate a limitless workspace.

Freehand Drawing: A pencil tool that mimics a natural writing feel.

Eraser Tool: Easily remove specific elements or parts of your drawings.

Shape Library: Includes modular rectangles, circles, and SVG-based clouds.

Smart Connectors: Draw arrows between shapes that automatically snap to nodes, keeping your diagrams organized when you move things around.

Rich Text Editing: Double-click any shape to edit its label using a custom overlay editor.

Image Support: Drag and drop images directly onto the canvas or load them via URL.

Custom Theming: Integrated "Chakra Petch" font and a dynamic grid background that adjusts as you move.

State Management: A custom Context and Reducer system ensures the application state is robust and predictable.

Tech Stack Used

Component

Technology

Description

Frontend Framework

React.js

Component-based UI structure

Canvas Engine

React-Konva

React bindings for the Konva 2D canvas library

Styling

Tailwind CSS

Utility-first CSS for UI overlays (Toolbar, Editors)

State Management

React Context API

Centralized store for shapes and viewport state

Icons/Fonts

Google Fonts

Chakra Petch for the modular aesthetic

Build Tool

Vite / Create React App

Fast development server and bundling

System Architecture / High-Level Design

The application follows a Unidirectional Data Flow architecture to keep data consistent:

StoreContext (Global State): This holds the "source of truth" for the application, including all shapes, connectors, and current viewport coordinates.

StageWrapper (Canvas Layer): This component listens to state changes and handles the actual rendering on the HTML5 Canvas via Konva. It also manages low-level pointer events like clicking and dragging.

UI Overlay (DOM Layer): Standard HTML/CSS components (like the Toolbar and Text Editor) sit physically above the canvas to ensure text inputs remain accessible and easy to interact with.

graph TD
    User[User Interaction] --> Toolbar
    User --> Canvas[StageWrapper / Canvas]
    
    Toolbar -- "Dispatch Action (Set Mode)" --> Store[StoreContext / Reducer]
    Canvas -- "Dispatch Action (Add/Update Shape)" --> Store
    
    Store -- "Updates State" --> Canvas
    Store -- "Updates UI" --> Toolbar


API Documentation

Currently, Holoboard functions as a full stack application, meaning data is stored on mongodb.

Future API Endpoints (Planned):

GET /api/board/:id - Load board state.

POST /api/board/:id - Save current board state.

WS /socket - WebSocket connection for real-time collaboration.

Setup Instructions

Follow these steps to run the project locally:

Clone the Repository

git clone [https://github.com/vaibhavrai25/holoboard.git](https://github.com/vaibhavrai25/holoboard.git)
cd holoboard


Install Dependencies

npm install
# or
yarn install


Run Development Server

npm run dev
# or
npm start


Open in Browser
Navigate to http://localhost:3000 (or the port shown in your terminal).

Deployment Link

[https://holoboard-frontend.onrender.com/] 

Screenshots

Infinite Canvas

Shape Tools

<img width="1905" height="906" alt="image" src="https://github.com/user-attachments/assets/8b672e75-64b0-46d1-acb2-9bd85b62002f" />

<img width="1916" height="887" alt="image" src="https://github.com/user-attachments/assets/6fc8fdd0-abc6-4247-b260-0f09d272eefd" />
<img width="1915" height="891" alt="image" src="https://github.com/user-attachments/assets/151a1469-8409-4060-a21a-1a987524a0c6" />







Error Handling & Reliability

Canvas Boundaries: The infinite canvas uses relative pointer positioning. This prevents drawing artifacts that often happen when zooming out too far on standard canvases.

Null Safety: We use optional chaining (?.) throughout the StoreContext to prevent the app from crashing if a selected shape is deleted unexpectedly.

Font Fallback: If the Google Fonts API fails to load "Chakra Petch", the application gracefully degrades to a standard sans-serif font so the text remains readable.

Input Sanitization: Text inputs in the shape editor are sanitized to prevent basic injection issues during rendering.



Current Status: Planned

Future Scope:

Hand-drawn recognition: We plan to implement models that convert messy mouse sketches into perfect geometric shapes.

Auto-Layout: We are looking into graph layout algorithms (like Dagre) to automatically organize complex connector webs for you.

Team Members

Name- Vaibhav Rai, Role- Backend and Frontend and database
Name- Purushottam Sharma, Role- Frontend and Backend
Name- Rajendra Kumar, Role- Frontend and UI UX
Name- Nisha , Role- UI/UX Designer





Made by Team Dev Dominators.
