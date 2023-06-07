# App-specific features 

A feature is self-contained. It contains everything inside its subdirectories except for any shared components which will be in `components/`.

ex.

```
features/
   Editor/
      Visualizer/
         ...
      SidePanel/
         ...
      VisualizerNav/
         ...
      ...
```

Here we have the Editor as a feature. To make the Editor work, the Visualizer, SidePanels, and the VisualizerNav are all necessary to make the Editor work. 
Any Buttons, Icons, etc will be generic and imported from `components/`.