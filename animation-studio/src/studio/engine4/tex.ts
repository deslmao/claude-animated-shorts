// Engine 4: a canvas texture that also works in Node (floor maps, validators, tests build sets without a DOM): there it is an empty texture.
import * as THREE from "three";
import { ctex } from "../materials/paint";
export const mkTex = (name: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.Texture =>
  typeof document === "undefined" ? new THREE.Texture() : ctex(name, w, h, draw);
