<template>
  <div id="background" class="w-full h-full">
    <img src="@/assets/img/background.jpg" alt="">
  </div>
  <div class="flex h-full">
      <div class="col drawer-container">
        <div class="prize-label text-center">&nbsp;<span v-if="haswinner">Winner of <span class="prize-color">{{ selectedPrize.label }}</span></span></div>
        <div id="container" ></div>
        <div v-if="winnerOnScreen" class="text-center prize-color" style="font-size:30pt; font-family: 'Times New Roman', Times, serif;">
          <div class="items-center pt-3" style="width:500px; margin:0 auto; line-height:25pt; border-top:5px solid white;">
            {{  winnerOnScreen.department }} ({{ winnerOnScreen.officeaccronym }}) 
          </div> 
        </div>
      </div>
      <div class="col-3 raffle-controls">
        <div class="w-full font-bold underline" style="text-align:center; font-size:40pt;">
          {{ drawcountdisplay }} DRAW{{ drawcountdisplay > 1 ? "S" : "" }}
        </div>
        <div class="w-full flex gap-1">

          <Select v-model="selectedPrize" 
          :options="filteredPrizes" 
          optionLabel="label" checkmark
          optionGroupLabel="label"  optionGroupChildren="items" placeholder="Select a Prize" class="w-full md:w-56">
            <template #optiongroup="slotProps">
                <div class="flex items-center">
                    <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`" style="width: 18px" />
                    <div>{{ slotProps.option.label }}</div>
                </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                  <div>{{ slotProps.option.count }} winner{{ slotProps.option.count>1 ? "s": '' }} of {{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>

          <InputNumber v-model="drawcount" id="drawcount" :min="0" :max="selectedPrizeLimit" checkmark  inputId="integeronly" fluid placeholder="Draw Count" />

        </div>

        <ButtonGroup class="w-full mt-2">
          <Button v-if="selectedPrize != null" size="small" @click="draw">DRAW</Button>
          <Button v-else disabled size="small" @click="draw">DRAW</Button>
          <Button size="small" @click="startInfiniteScroll">ROLL</Button>
          <Button size="small" @click="clearRoller">CLEAR</Button>
        </ButtonGroup>
        <div id="winnerlist">
          <ol>
            <li v-for="(winner, index) in winners" :key="index" :class="`rainbow-${winner.set}`">
             {{ winner.name }} [ <b>{{ winner.prize.label }}</b> ]
            </li>
          </ol>
        </div>      
      </div>
  </div>

</template>

<script>
import nameentries from '@/data/entries.json';
import prizelists from '@/data/prizes.json';
import { toRaw } from "vue";
import _ from "lodash";

export default {
  data() {
    return {
      letters: [...Array(26)].map((_, i) => String.fromCharCode(65 + i)).concat(["-", ",", "."]),
      names: nameentries,
      drawSet: 0,
      drawcount: 1,  
      drawcountdisplay: 1,  
      drawInterval: 1000,
      container: null,
      winnerlist: [],
      haswinner: false,
      winners: [],
      drawIndex: 1,
      rollLength: 20,
      itemHeight: 90,
      animationTrigger: null,
      rollHasEnded: false,
      banners: [],
      winnerOnScreen: null,
      prizes: prizelists,
      selectedPrizeLimit: 0,
      selectedPrize: [],
      disableInsteadOfRemove: false,
    };
  },
  watch:{
    selectedPrize(val){
      this.selectedPrizeLimit = val.count;
      this.drawcountdisplay = val.count;
      this.drawcount = val.count;
    },
    drawcount(val){
      this.drawcountdisplay = val;
    },
  },
  computed: {
    filteredPrizes() {
      return this.prizes.map((group) => ({
        ...group,
        items: group.items.filter((item) => (this.disableInsteadOfRemove ? true : item.count > 0)),
      }));
    },
  },
  mounted() {
    this.container = document.getElementById("container");
  },
  methods: {
    initializeRaffle(columnCount) {
      this.container.innerHTML = "";
      this.banners = [];
      for (let i = 0; i < columnCount; i++) {
        const banner = this.createColumn();
        this.banners.push(banner);
      }
    },
    createColumn() {
      const column = document.createElement("div");
      column.classList.add("column");

      const banner = document.createElement("div");
      banner.classList.add("photobanner");

      this.letters.concat(this.letters).forEach((letter) => {
        const item = document.createElement("div");
        item.classList.add("item");
        item.textContent = letter;
        banner.appendChild(item);
      });

      column.appendChild(banner);
      this.container.appendChild(column);
      return banner;
    },
    animateColumn(banner, targetLetter, duration, onComplete) {
      const itemHeight = this.itemHeight;
      const totalItems = this.letters.length;
      const letterIndex = this.letters.indexOf(targetLetter.toUpperCase());
      const totalDistance = totalItems * itemHeight;
      const startTime = performance.now();

      const easeOutQuad = (t) => t * (2 - t);

      const step = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentPosition = totalDistance * easedProgress;

        banner.style.transform = `translateY(${
          -currentPosition % (itemHeight * totalItems)
        }px)`;

        if (progress < 1) {
          this.animationTrigger = requestAnimationFrame(step);
        } else {
          banner.style.transition = "transform 0.5s ease-out";
          banner.style.transform = `translateY(${-letterIndex * itemHeight}px)`;
          if (onComplete) onComplete();
        }
      };

      this.animationTrigger = requestAnimationFrame(step);
    },
    draw() {
      // if (this.drawcount > this.remainingPrizeCount) {
      //   alert("Not enough prizes available.");
      //   return;
      // }
      this.drawSet++;
      this.startDraw();
    },
    // Shuffle array for true randomness
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    startDraw() {
      this.haswinner = false;
      this.winnerOnScreen = null;
      const availableNames = [...this.names]; // Copy names to avoid modifying the original array
      const selectedNames = this.shuffleArray(availableNames).slice(0, this.drawcount); // Select unique names
      const interval = this.drawInterval; // Adjustable interval in milliseconds

      const drawCycle = (nameIndex) => {
        if (nameIndex >= selectedNames.length) {
          // Reset the drawIndex for the next draw
          this.drawIndex = 1;
          return;
        }

        const selectedItem = selectedNames[nameIndex];
        console.log(selectedItem);
        const name = `${selectedItem.firstname} ${selectedItem.middlename != "" ? selectedItem.middlename.substring(0,1).trim()+"." : ''} ${selectedItem.lastname} ${selectedItem.suffix}`;
        const selectedLetters = name.split("");
        
        this.initializeRaffle(selectedLetters.length);
        
        let completedAnimations = 0;
        selectedLetters.forEach((letter, index) => {
          const duration = 1000 + index * 100;
          this.animateColumn(this.banners[index], letter, duration, () => {
            completedAnimations++;
            if (completedAnimations === selectedLetters.length) {
              const info = {
                name: name,
                index: this.drawIndex,
                id: `${this.drawSet}-${this.drawIndex}`,
                set: this.drawSet,
                department: selectedItem.department,
                officeaccronym: selectedItem.officeaccronym,
                position: selectedItem.position,
                jobstatus: selectedItem.jobtype,
                prize: this.selectedPrize,
                prizeid: this.selectedPrize.id
              };
              
              
              
              // if (!this.selectedPrize || this.selectedPrize.count <= 0) return;
              
              this.winners.push(info);
              this.drawIndex++;
              this.winnerOnScreen = selectedItem;
              // Move to the next name after the interval
              setTimeout(() => drawCycle(nameIndex + 1), interval);
              this.haswinner = true;
            }
          });
        });
        this.updatePrizeCount();
        this.markPrizeAsDrawn(this.selectedPrize);
      };

      drawCycle(0); // Start with the first name
    },
    markPrizeAsDrawn(prize) {
      prize.count -= 1;
      this.selectedPrizeLimit = prize.count;
      this.drawcountdisplay = prize.count;
      this.drawcount = prize.count;
      if (prize.count === 0 && !this.disableInsteadOfRemove) {
        const group = this.prizes.find((grp) => grp.items.includes(prize));
        group.items = group.items.filter((item) => item.id !== prize.id);

        if (group.items.length === 0) {
          this.prizes = this.prizes.filter((grp) => grp !== group);
        }
      }
    },
    updatePrizeCount() {
      const group = this.prizes.find((g) =>
        g.items.some((item) => item.id === this.selectedPrize.id)
      );
      const prize = group.items.find((item) => item.id === this.selectedPrize.id);

      const drawnWinners = this.winners.filter((w) => w.prize.id === prize.id);
      // prize.count -= drawnWinners.length;
      //prize.count
      // Remove the prize from the list if its count drops to zero
      if (prize.count <= 0) {
        //group.items = group.items.filter((item) => item.id !== prize.id);

        // Remove group if no items left
        if (group.items.length === 0) {
          this.prizes = this.prizes.filter((g) => g !== group);
        }
      }
    },
    clearRoller() {
      this.winners = [];
      this.selectedPrize = [];
      this.haswinner = false;
      this.initializeRaffle(0);
      cancelAnimationFrame(this.animationTrigger);
    },
    startInfiniteScroll() {
      this.initializeRaffle(this.rollLength);
      const scrollBanner = (banner) => {
        const itemHeight = this.itemHeight;
        const totalItems = this.letters.length;
        const r = Math.floor(Math.random() * this.rollLength);
        let currentPosition = 0;
        
        const scrollStep = () => {
          currentPosition += itemHeight / 2;
          banner.style.transform = `translateY(-${currentPosition % (itemHeight * totalItems)}px)`;
          this.animationTrigger = requestAnimationFrame(scrollStep);
        };
        setTimeout(() => {
          scrollStep();
        }, 10*r);
      };

      this.banners.forEach(scrollBanner);
    },
  },
};
</script>

<style scoped>
/* Add your CSS styles here */
</style>
